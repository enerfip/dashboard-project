import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

export const getEnerfipQueryResult = async (queryId, apiKey) => {
  try {
    const response = await axios.get(`${baseURL}/api/queries/${queryId}/results`, {
      headers: {
        "Content-Type": "application/json",
      },
      params: {
        "refresh": 10,
        "api_key": apiKey,
      }
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const parseEnerfipResponse = (rawData) => {
  const rows = rawData?.query_result?.data?.rows;
  if (rows === undefined || rows.length === 0) {
    throw new Error("No data available");
  }

  return rows
};

export const parseEnerfipAmountData = (rawData) => {
  const rows = parseEnerfipResponse(rawData);
  return rows[0].collected_amount;
};
