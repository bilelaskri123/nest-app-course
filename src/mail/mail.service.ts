import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, RequestTimeoutException } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendLoginEmail(email: string) {
    const today = new Date();
    try {
      const result = await this.mailerService.sendMail({
        to: email,
        from: '<no-reply@my-nestjs-app.com>',
        subject: 'Log in',
        template: 'login', // the `.ejs` extension is appended automatically
        context: {
          // data to be sent to template engine
          today,
          email,
        },
      });
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException();
    }
  }

  public async sendVerifyEmailTemplate(email: string, link: string) {
    try {
      const result = await this.mailerService.sendMail({
        to: email,
        from: '<no-reply@my-nestjs-app.com>',
        subject: 'Verify your account',
        template: 'verify-email', // the `.ejs` extension is appended automatically
        context: {
          // data to be sent to template engine
          link,
        },
      });
    } catch (error) {
      console.log(error);
      throw new RequestTimeoutException();
    }
  }

  /**
   * Sending reset password template
   * @param email email of the user
   * @param resetPasswordLink link with id of the user and reset password token
   */
  public async sendResetPasswordTemplate(
    email: string,
    resetPasswordLink: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: `<no-reply@my-nestjs-app.com>`,
        subject: 'Reset password',
        template: 'reset-password',
        context: { resetPasswordLink },
      });
    } catch (error) {
      console.log(error);
    }
  }
}
