import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { TransferUseCase } from './TransferUseCase';

export class TransferController {
  async execute(request: Request, response: Response) {
    const { id: user_id } = request.user;
    const { destination_user_id } = request.params;
    const { amount, description } = request.body;

    const transfer = container.resolve(TransferUseCase);

    const transference = await transfer.execute({
      user_id,
      destination_user_id,
      amount,
      description,
    });

    return response.json(transference);
  }
}
