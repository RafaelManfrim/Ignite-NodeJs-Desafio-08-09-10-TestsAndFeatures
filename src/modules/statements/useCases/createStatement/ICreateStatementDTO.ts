import { OperationType } from "../../entities/Statement";

export type ICreateStatementDTO = {
  user_id: string;
  type: OperationType;
  amount: number;
  description: string;
  sender_id?: string;
}

