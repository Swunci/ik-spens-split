import CustomError from '../errors/customError';

export async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new CustomError();
    error.status = res.status;
    error.info = await res.json();
    throw error;
  }
  return res.json();
}
