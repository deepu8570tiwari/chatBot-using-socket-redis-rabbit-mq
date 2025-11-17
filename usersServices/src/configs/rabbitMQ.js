import amqp from "amqplib";
import dotenv from "dotenv";
dotenv.config();
let channel;
export const connectRabbitMq = async () => {
    while (true) {
        try {
            const connection = await amqp.connect({
                protocol:process.env.RabbitMQ_protocol,
                hostname: process.env.RabbitMQ_hostname,
                port: process.env.RabbitMQ_port,
                username: process.env.RabbitMQ_username,
                password:process.env.RabbitMQ_password
            });

            channel = await connection.createChannel();
            console.log("RabbitMQ is connected Successfully");
            connection.on("close", () => {
            console.error("❗ RabbitMQ connection closed. Reconnecting...");
            channel = null;
            setTimeout(connectRabbitMq, 5000);
        });

        connection.on("error", (err) => {
            console.error("❗ RabbitMQ connection error:", err.message);
        });

        return;
        } catch (error) {
            console.error("❌ RabbitMQ connection failed:", error.message);
        console.log("🔁 Retrying in 3 seconds...");
        await new Promise((res) => setTimeout(res, 3000));
        }
    }
};
export const publishToQueue=async(queueName, message)=>{
    if(!channel){
        console.log("RabbitMq channel is not intialized");
        return;
    }
    await channel.assertQueue(queueName,{durable:true});
    channel.sendToQueue(queueName,Buffer.from(JSON.stringify(message)),{
        persistent:true,
    })
    console.log(`📨 Message sent to queue: ${queueName}`);
}