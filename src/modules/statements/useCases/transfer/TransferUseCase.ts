import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { TransferError } from "./TransferError";

interface IRequest {
  user_id: string;
  destination_user_id: string;
  amount: number;
  description: string;
}

@injectable()
export class TransferUseCase {
  constructor(
    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository,

    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) { }

  async execute({
    user_id,
    destination_user_id,
    amount,
    description,
  }: IRequest) {
    const user = await this.usersRepository.findById(user_id);
    const destination_user = await this.usersRepository.findById(destination_user_id);

    if (!user || !destination_user) {
      throw new TransferError.UserNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({ user_id });

    if (balance < amount) {
      throw new TransferError.InsufficientFunds()
    }

    const user_transference = await this.statementsRepository.create({
      user_id,
      type: OperationType.TRANSFER,
      amount,
      description,
    });

    await this.statementsRepository.create({
      user_id: destination_user_id,
      type: OperationType.TRANSFER,
      amount,
      description,
      sender_id: user_id,
    });

    return user_transference;
  }
}