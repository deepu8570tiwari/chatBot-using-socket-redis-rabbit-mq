import amqp from "amqplib";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();
export const sendOTPConsumer=async()=>{
    try {
        const connection = await amqp.connect({
            protocol:process.env.RabbitMQ_protocol,
            hostname: process.env.RabbitMQ_hostname,
            port: process.env.RabbitMQ_port,
            username: process.env.RabbitMQ_username,
            password:process.env.RabbitMQ_password
        });
        let channel= await connection.createChannel();
        const queueName="send-otp";
        await channel.assertQueue(queueName,{durable:true});
        console.log("Mail Services consumer is connected successfully with the help of RabbitMQ");
        channel.consume(queueName,async(message)=>{
            if(message){
                try {
                    const {to, subject, body}=JSON.parse(message.content.toString());
                    const transporter=nodemailer.createTransport({
                        host:"smtp.gmail.com",
                        port:465,
                        auth:{
                            user:process.env.MAILUSERNAME,
                            pass:process.env.MAILPASSWORD
                        }
                    })
                    await transporter.sendMail({
                        from:"ChatApp",
                        to,
                        subject,
                        text:body
                    })
                    console.log(`OTP Mail Send to ${to}`);
                    channel.ack(message);
                } catch (error) {
                    console.log("failed to send the OTP", error)
                }
            }
        })
    } catch (error) {
        console.log("failed to start rabbitMQ consumer", error)
    }
}