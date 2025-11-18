import amqp from "amqplib";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

export const sendOTPConsumer = async () => {
    try {
        const connection = await amqp.connect({
            protocol: process.env.RabbitMQ_protocol,
            hostname: process.env.RabbitMQ_hostname,
            port: process.env.RabbitMQ_port,
            username: process.env.RabbitMQ_username,
            password: process.env.RabbitMQ_password
        });

        const channel = await connection.createChannel();
        const queueName = "send-otp";

        await channel.assertQueue(queueName, { durable: true });
        console.log("Mail Service connected to RabbitMQ ✔");   // Only prints ONCE

        channel.consume(queueName, async (message) => {
            if (message) {
                try {
                    const { to, subject, body } = JSON.parse(message.content.toString());

                    const transporter = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        port: 465,
                        secure: true,
                        auth: {
                            user: process.env.MAILUSERNAME,
                            pass: process.env.MAILPASSWORD
                        }
                    });

                    await transporter.sendMail({
                        from: "ChatApp",
                        to,
                        subject,
                        text: body
                    });

                    console.log(`OTP sent to ${to} ✔`);
                    channel.ack(message);

                } catch (error) {
                    console.log("Failed to send OTP ❌", error);
                }
            }
        });

    } catch (error) {
        console.error("❌ RabbitMQ connection failed:", error.message);
    }
};
