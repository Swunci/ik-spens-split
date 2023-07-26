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

export async function multiFetcher(urls: Array<string>) {
  return Promise.all(
    urls.map((url: string) => {
      return fetcher(url);
    })
  );
}
