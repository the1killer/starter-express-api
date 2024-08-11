import axios from 'axios';

export const handler = async (event) => {
    try {
        // Make a GET request to the API Gateway endpoint
        const response = await axios.get(process.env.CRON_URL);

        // Log the response from the API Gateway
        console.log(response.data);

        return {
            statusCode: 200,
            body: 'Success',
        };
    } catch (error) {
        console.error(error);

        return {
            statusCode: 500,
            body: 'Error',
        };
    }
};