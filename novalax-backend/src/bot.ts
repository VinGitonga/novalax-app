import { Bot, CommandContext, Context } from "grammy";
import { TELEGRAM_BOT_TOKEN } from "./constants";
import { createReactAgent, ToolNode } from "@langchain/langgraph/prebuilt";
import { convertToOpenAITool } from "@langchain/core/utils/function_calling";
import { END, MemorySaver, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { User } from "grammy/types";
import { StructuredTool } from "@langchain/core/tools";
import { ChatPromptTemplate, MessagesPlaceholder, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { accessPremiumFileTool, getMySubscriptionsTool, makePaymentTool, setupRecurringPayment } from "./tools";

const bot = new Bot(TELEGRAM_BOT_TOKEN);

interface AgentConfig {
	configurable: {
		thread_id: string;
		user_id: string;
		username: string;
	};
}

type TUser = User;

type TUserState = Record<string, any>;

const userStates: TUserState = {};

type Agent = ReturnType<typeof createReactAgent>;
const memoryStore: Record<string, MemorySaver> = {};

const agentStore: Record<string, { agent: Agent; config: AgentConfig }> = {};

const updateUserState = (user: TUser, state: any) => {
	userStates[user.id] = { ...userStates[user.id], ...state };
};

const sendReply = async (ctx: CommandContext<Context>, text: string, options: Record<string, any> = {}) => {
	const msg = await ctx.reply(text, options);
	updateUserState(ctx.from, { messageId: msg.message_id });
};

function askHuman(state: typeof MessagesAnnotation.State): Partial<typeof MessagesAnnotation.State> {
	const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
	const toolCallId = lastMessage.tool_calls?.[0].id;
	console.log(`Human input required: ${lastMessage.content}`);
	console.log("Options: approve, reject, adjust (with JSON input)");
	return { messages: [] };
}

function shouldContinue(state: typeof MessagesAnnotation.State): "action" | "askHuman" | typeof END {
	const lastMessage = state.messages[state.messages.length - 1] as AIMessage;

	if (lastMessage && !lastMessage.tool_calls?.length) {
		return END;
	}

	if (lastMessage.tool_calls?.[0]?.name === "askHuman") {
		console.log("--- ASKING HUMAN ---");
		return "askHuman";
	}

	return "action";
}

async function createAgent({ llm, tools, system_message }: { llm: ChatOpenAI; tools: StructuredTool[]; system_message: string }) {
	const toolNames = tools.map((tool) => tool.name).join(", ");
	const formattedTools = tools.map((t) => convertToOpenAITool(t));

	let prompt = ChatPromptTemplate.fromMessages([
		["system", "You are Novalax, a helpful AI assistant assisting users to setup their recurring payments." + " You have access to the following tools: {tool_names}.\n{system_message}"],
		new MessagesPlaceholder("messages"),
	]);

	prompt = await prompt.partial({
		system_message: system_message,
		tool_names: toolNames,
	});

	return prompt.pipe(llm.bindTools(formattedTools));
}

async function initAgent(user_id: string, username: string) {
	const llm = new ChatOpenAI({ temperature: 0.7 });
	const embeddings = new OpenAIEmbeddings();

	memoryStore[user_id] = new MemorySaver();

	const allTools = [makePaymentTool, setupRecurringPayment, getMySubscriptionsTool, accessPremiumFileTool];

	const agentConfig: AgentConfig = {
		configurable: { thread_id: user_id, user_id: user_id, username: username },
	};

	const toolNode = new ToolNode<typeof MessagesAnnotation.State>([...allTools]);

	const currentDate = new Date().toLocaleDateString();
	const currentTime = new Date().toLocaleTimeString();

	const system_message = `You are Novalax Agent, a helpful AI assistant assisting users to setup to manage payments on Novalax Platform. You can answer any question the user might have.
	
	Current Date is ${currentDate} at approximately ${currentTime}.

	You can use the following tools too to assist users: ${allTools.map((tool) => `- **${tool.name}**: ${tool.description}`).join("\n")}

	Generate output in markdown format.
	`;

	const modelWithTools = llm.bindTools(allTools.map((t) => convertToOpenAITool(t)));
	// const agentModel = await createAgent({ llm, tools: allTools, system_message: "Be brief and concise" });
	// const model = prompt.pipe(modelWithTools);

	async function callModel(state: typeof MessagesAnnotation.State) {
		const response = await modelWithTools.invoke([{ role: "system", content: system_message }, ...state.messages]);

		// We return a list, because this will get added to the existing list
		return { messages: [response] };
	}

	const workflow = new StateGraph(MessagesAnnotation)
		.addNode("agent", callModel)
		.addNode("action", toolNode)
		.addNode("askHuman", askHuman)
		.addEdge(START, "agent")
		.addEdge("action", "agent")
		.addEdge("askHuman", "agent")
		.addConditionalEdges("agent", shouldContinue);

	const app = workflow.compile({ checkpointer: memoryStore[user_id] });

	return { app, agentConfig };
}

async function handleAndStreamMessage(ctx: Context) {
	const { from: user } = ctx;
	const message = ctx.message;
	const user_id = String(user.id);
	const username = ctx.from.username;

	let agentData = agentStore[user_id];
	if (!agentData) {
		const { agentConfig, app } = await initAgent(user_id, username);
		agentData = { config: agentConfig, agent: app };
		agentStore[user_id] = agentData;
	}
	const { agent, config } = agentData;

	let state = await agent.getState(config);

	// Send initial placeholder message
	let sentMessage = await ctx.reply("typing", { parse_mode: "MarkdownV2" });
	let response = "";

	// Choose stream input based on state
	let stream;
	if (state.next.includes("askHuman")) {
		stream = await agent.stream({ resume: message.text }, config);
	} else {
		stream = await agent.stream(
			{
				messages: [new HumanMessage({ content: message.text, additional_kwargs: { user_id } })],
			},
			config
		);
	}

	// Stream and edit message
	for await (const event of stream) {
		if (!event.__end__) {
			const node = Object.keys(event)[0];
			const messages = event[node].messages;
			if (messages && messages.length > 0) {
				const recentMsg = messages[messages.length - 1] as BaseMessage;
				const content = String(recentMsg.content).trim();
				if (content) {
					response += content + "\n";
					console.log("response", response);
					const escapedResponse = response.replace(/([\\_*`|!.[\](){}>+#=~-])/gm, "\\$1");
					await ctx.api.editMessageText(ctx.chat.id, sentMessage.message_id, escapedResponse, { parse_mode: "MarkdownV2" });
				}
			}
		}
	}

	// Optionally, handle post-stream state (e.g., ask for human input)
	state = await agent.getState(config);
	if (state.next.includes("askHuman")) {
		const lastMessage = state.values.messages[state.values.messages.length - 1] as BaseMessage;
		response = `${lastMessage.content}\nPlease respond with 'approve', 'reject', or 'adjust' (with JSON, e.g., {\"amount\": 500}).`;
		const escapedResponse = response.replace(/([\\_*`|!.[\](){}>+#=~-])/gm, "\\$1");
		await ctx.api.editMessageText(ctx.chat.id, sentMessage.message_id, escapedResponse, { parse_mode: "MarkdownV2" });
	}
}

bot.command("start", async (ctx) => {
	console.log("here");
	const { from: user } = ctx;
	// init agent per user, if no user agent instance (create one)
	await initAgent(user.id.toString(), user.username);
	updateUserState(user, {});

	// should get account details

	const welcomeMsg = `Welcome to Novalax, an AI Agent to assist you to manage your payments onchain on Hedera.`;

	await sendReply(ctx, welcomeMsg.replace(/([\\_*`|!.[\](){}>+#=~-])/gm, "\\$1"), { parse_mode: "MarkdownV2" });
});

bot.on("message:text", async (ctx) => {
	await handleAndStreamMessage(ctx);
});

bot.start();
