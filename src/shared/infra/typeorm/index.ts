import { createConnection, getConnectionOptions } from "typeorm";

export default async (host = "localhost") => {
  const defaultOptions = await getConnectionOptions();

  return createConnection(
    Object.assign(defaultOptions, {
      host,
      database: "fin_api",
    })
  );
};