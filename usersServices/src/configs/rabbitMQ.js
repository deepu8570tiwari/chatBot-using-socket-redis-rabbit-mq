import amqp from "amqplib";
import dotenv from "dotenv";
dotenv.config();
let channel;
export const connectRabbitMq = async () => {
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
    } catch (error) {
        console.error("Failed to connect to RabbitMQ:", error);
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
}