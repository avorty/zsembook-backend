import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class FaqService {
  constructor(
    private readonly prisma: DbService,
    private readonly mailerService: MailerService,
  ) {}

  async askQuestion(question: string, askerId: number) {
    await this.prisma.faq.create({
      data: { question, askerId },
    });
  }

  getAnsweredQuestions(): Promise<any[]> {
    return this.prisma.faq.findMany({
      where: { isAnswered: true },
      orderBy: { hierarchy: 'desc' },
    });
  }

  getAllUnansweredQuestions(): Promise<any[]> {
    return this.prisma.faq.findMany({
      where: { isAnswered: false },
      orderBy: { hierarchy: 'desc' },
    });
  }

  async getUnansweredQuestions(userId: number): Promise<any[]> {
    return await this.prisma.faq.findMany({
      where: {
        askerId: userId,
        isAnswered: false,
      },
      orderBy: { hierarchy: 'desc' },
    });
  }

  async answerQuestion(questionId: number, question: string, answer: string) {
    await this.prisma.faq.update({
      where: { id: questionId },
      data: { question, answer, isAnswered: true },
    });
  }

  async changeQuestion(questionId: number, question: string) {
    await this.prisma.faq.update({
      where: { id: questionId },
      data: { question },
    });
  }

  async changeHierarchy(questionId: number, hierarchy: number) {
    await this.prisma.faq.update({
      where: { id: questionId },
      data: { hierarchy },
    });
  }

  async deleteQuestion(questionId: number) {
    await this.prisma.faq.delete({
      where: { id: questionId },
    });
  }

  async sendMailAboutNewQuestion(question: string) {
    const moderators = await this.prisma.user.findMany({
      where: {
        Roles: {
          some: { role: 'MODERATOR' },
        },
      },
      select: { email: true },
    });
    const emails: string[] = moderators.map((e) => e.email);

    const htmlEmailContent = `
      <h1>Właśnie dodano nowe pytanie na FAQ:</h1>
      <p>${question}</p>
    `;

    this.mailerService.sendMail({
      to: emails,
      from: 'noreply@basedbook.com',
      subject: 'Zadano nowe pytanie na FAQ',
      html: htmlEmailContent,
    });
  }
}
