import { client } from "../utils";

export const signOut = () => {
  client.auth.signOut();
};

export const getUserId = async () => {
  const { data, error } = await client.auth.getSession();
  return data.session?.user.id;
};
