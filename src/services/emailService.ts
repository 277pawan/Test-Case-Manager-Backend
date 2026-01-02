import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendAssignmentEmail = async (to: string, testCaseTitle: string, assignerName: string, testCaseId: number, projectId: number) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Test Case Manager <onboarding@resend.dev>',
            to: [to], // Note: onboarding@resend.dev can only send to the registered email in free tier
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
                    
                    <a href="${process.env.FRONTEND_URL || 'https://test-case-manager-frontend.vercel.app'}/projects/${projectId}/test-cases/${testCaseId}" 
                       style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        View Test Case
                    </a>
                </div>
            `,
        });

        if (error) {
            console.error('Error sending email:', error);
            return false;
        }

        console.log('Email sent successfully:', data);
        return true;
    } catch (error) {
        console.error('Exception sending email:', error);
        return false;
    }
};
