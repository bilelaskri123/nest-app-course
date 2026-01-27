import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, RequestTimeoutException } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendLoginEmail(email: string) {
    const today = new Date();
    try {
      console.log(this.mailerService.verifyAllTransporters());
      const result = await this.mailerService.sendMail({
        to: email,
        from: '<no-reply@my-nestjs-app.com>',
        subject: 'Log in',
        html: `
        <div>
            <h2>Hi ${email}</h2>
            <p>
                You Logged in to your accout in ${today.toDateString()} at ${today.toLocaleTimeString()}
            </p>
        </div>`,
      });
      console.log(result);
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException();
    }
  }
}
