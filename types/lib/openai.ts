import { OpenAI, ClientOptions } from "openai";

// 创建一个配置对象
const clientOptions = {
    apiKey: process.env.CHATGPT_API_KEY, // 你可以直接在这里提供apiKey，或者确保它在环境变量中
    // organization: "你的组织ID", // 同样，这个是可选的
    baseURL: process.env.CHATGPT_API_BASE_URL,
};

// 使用配置对象创建OpenAI客户端实例
const openai = new OpenAI(clientOptions);


export default openai