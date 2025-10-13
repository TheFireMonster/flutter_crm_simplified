
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ProductsServicesService } from '../../products_services/products_services.service';
import { AppointmentsService } from '../../appointments/appointments.service';

@Injectable()
export class AIChatService {

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly productsServicesService: ProductsServicesService,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  async ask(prompt: string): Promise<string> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    const products = await this.productsServicesService.findAll();
    const appointments = await this.appointmentsService.getAll();

    const productList = products.map(p => p.name).join(', ');
    const appointmentList = appointments.map(a => `${a.title} em ${a.appointmentDate}`).join('; ');

    const systemPrompt =
      'Você é um assistente CRM útil. Sempre responda em português. ' +
      'Produtos/Serviços disponíveis: ' + productList + '. ' +
      'Agendamentos: ' + appointmentList + '. ' +
      'Ajude os clientes/pacientes a agendar consultas e resolver problemas.';

    const response = await firstValueFrom(
      this.httpService.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          stream: true,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      )
    );
    return response.data.choices[0].message.content;
  }
}
