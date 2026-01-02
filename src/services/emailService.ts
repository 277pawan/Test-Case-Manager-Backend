import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendAssignmentEmail = async (to: string, testCaseTitle: string, assignerName: string, testCaseId: number, projectId: number) => {
    try {
        const info = await transporter.sendMail({
            from: '"Test Case Manager" <no-reply@testcasemanager.com>',
            to,
            subject: `New Test Case Assigned: ${testCaseTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #333;">New Assignment</h2>
                    <p>Hello,</p>
                    <p>You have been assigned a new test case by <strong>${assignerName}</strong>.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin: 0 0 10px 0;">${testCaseTitle}</h3>
                        <p style="margin: 0;">ID: #${testCaseId}</p>
                    </div>

                    <p>Please log in to the system to review and execute the test case.</p>
                    
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/projects/${projectId}/test-cases/${testCaseId}" 
                       style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        View Test Case
                    </a>
                </div>
            `,
        });

        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};
