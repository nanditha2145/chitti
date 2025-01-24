const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const https = require('https');
require('dotenv').config({ path: 'C:/Users/Support/chitti chatbot/zoho.env' })
const dialogflow = require('@google-cloud/dialogflow');
const sessionClient = new dialogflow.SessionsClient({
    keyFilename: 'C:/Users/Support/chitti chatbot/chitti-moob-33fe56e0e0e6.json', // Replace with the actual path
  });
  let accessToken = '';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// const ZOHO_API_BASE = 'https://accounts.zoho.com/oauth/v2';
// const ZOHO_API_KEY = '1000.9cff4f1075a27003a25290eabcf5173b.0300a01c5a4cae8c0b6974df37c9b357'; // Replace with your actual Zoho API Key
const ZOHO_CLIENT_ID=process.env.ZOHO_CLIENT_ID
const ZOHO_CLIENT_SECRET=process.env.ZOHO_CLIENT_SECRET
const ZOHO_REFRESH_TOKEN=process.env.ZOHO_REFRESH_TOKEN

const GOOGLE_PROJECT_ID = "chitti-moob";
// console.log(process.env,"processs")
const REDIRECT_URI = process.env.ZOHO_REDIRECT_URI;
// console.log(REDIRECT_URI,"redirect_uri")
const ZOHO_API_BASE = process.env.ZOHO_API_BASE;
// const code=process.env.code
let authCode='';
let refresh_token = ''; // Will hold the refresh token after authorization
// let accessToken = '';  // Will hold the access token after refresh


// URL 
// https://accounts.zoho.com/signin?servicename=AaaServer&serviceurl=https%3A%2F%2Faccounts.zoho.com%2Foauth%2Fv2%2Fauth%3Fscope%3DZohoPeople.employee.ALL,ZohoPeople.timetracker.ALL,ZohoPeople.attendance.ALL,ZohoPeople.leave.ALL%26client_id%3D1000.OZ5FDM6BHYRA3RPBX73Z63AKB35RIE%26response_type%3Dcode%26redirect_uri%3Dhttp%253A%252F%252Flocalhost%253A3000%252Fcallback%26access_type%3Doffline
// {
//     "access_token": "1000.cfa542ef5b0234cbf6d4263596583511.4181e4718ea1e77c1b7066a9aeeba90f",
//     "refresh_token": "1000.8d53176edcb2a6b358c526b82e304f4b.3ce83932bba1a3b51a52c47fabda8082",
//     "scope": "ZohoPeople.employee.ALL ZohoPeople.timetracker.ALL ZohoPeople.attendance.ALL ZohoPeople.leave.ALL",
//     "api_domain": "https://www.zohoapis.com",
//     "token_type": "Bearer",
//     "expires_in": 3600
// }

// {
//     "access_token": "1000.79f0978e22b57979ded1515395a0ba64.6f2749de5ef76793f3e25df91d6a5d0b",
//     "refresh_token": "1000.a1ebf69235a3d8f13193f63e5814b704.807af0dd7d4f7c2aeee43dc01b513f93",
//     "scope": "ZohoCRM.modules.ALL",
//     "api_domain": "https://www.zohoapis.com",
//     "token_type": "Bearer",
//     "expires_in": 3600
// }

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Zoho Integration</title>
        </head>
        <body>
            <h1>Zoho Integration</h1>
            <button onclick="startAuthorization()">Start Authorization</button>
             

            <script>
                async function startAuthorization() {
                    window.location.href = '/auth'; // Redirect to the authorization endpoint
                }

            </script>
        </body>
        </html>
    `);
});


// Authorization Callback
app.get('/auth', (req, res) => {
    const authUrl = `https://accounts.zoho.com/oauth/v2/auth?scope=ZohoPeople.Leave.ALL&client_id=${ZOHO_CLIENT_ID}&response_type=code&access_type=offline&redirect_uri=${REDIRECT_URI}`;
    res.redirect(authUrl);
    // const authCode = req.query.code; // Extract the 'code' parameter from the query
    // if (authCode) {
    //     console.log('Authorization Code:', authCode);
    //     code=authCode
    //     res.send('Authorization successful! Check your terminal for the authorization code.');
    // } else {
    //     res.status(400).send('Authorization failed. No code received.');
    // }
});
app.get('/callback', (req, res) => {
     authCode = req.query.code; // Extract the 'code' parameter from the query
    if (authCode) {
        console.log('Authorization Code:', authCode);
        
        res.send(res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Authorization successful! Check your terminal for the authorization code.</title>
            </head>
            <body>
                <h1>Authorization successful! Check your terminal for the authorization code.</h1>
                <button onclick="startAuthorization()">Leave Balance</button>
                 
    
                <script>
                    async function startAuthorization() {
                        window.location.href = '/leave-balance'; // Redirect to the authorization endpoint
                    }
    
                </script>
            </body>
            </html>
        `));
    } else {
        res.status(400).send('Authorization failed. No code received.');
    }
});
const getAuthCode = async () => {
    const authUrl = `https://accounts.zoho.com/oauth/v2/auth?scope=ZohoPeople.Leave.ALL&client_id=${ZOHO_CLIENT_ID}&response_type=code&access_type=offline&redirect_uri=${REDIRECT_URI}`;
    console.log(`Initiating authorization flow...`);
const loginUrl='https://accounts.zoho.com/signin'
    try {
        const loginResponse = await axios.post(loginUrl, {
            username: 'vijay.adepu@techdemocracy.com',
            password: 'Tcd$3698',
        });

        if (loginResponse.status === 200) {
            console.log(loginResponse,'Logged in successfully.');
        const response = await axios.get(authUrl,{ maxRedirects: 0, validateStatus: status => status === 302 });
        // response.status(200).json(response.data);
        console.log(response,"response for auth code")
        const location = response.headers.location;
        console.log(location,"location for authcode")
        const codeMatch = new URLSearchParams(location).get('code');

        console.log(codeMatch,"location for authcode")
        if (codeMatch) {
            authCode = codeMatch;
            console.log('Authorization Code:', authCode);
            await exchangeAuthorizationCode();
        } else {
            throw new Error('Authorization code not found in the redirect response.');
        }
        }
    } catch (error) {
        console.error('Error during authorization automation:', error.message);
        throw new Error('Failed to automate authorization.');
    }
}
const exchangeAuthorizationCode = async () => {
    if(!authCode){
        await getAuthCode();
    }
    const url = 'https://accounts.zoho.com/oauth/v2/token';
    const payload = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: ZOHO_CLIENT_ID,
        client_secret: ZOHO_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: authCode
    });

    try {
        const response = await axios.post(url, payload, 
            {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        accessToken = response.data.access_token;
        console.log('Access Token:', accessToken);

        // return  refresh_token ;
    } catch (error) {
        console.error('Error exchanging authorization code:', error.response?.data || error.message);
        throw new Error('Failed to exchange authorization code');
    }
};
// Refresh Access Token
// const refreshAccessToken = async () => {
//     try {
//         // if(!refresh_token){
//         //     await exchangeAuthorizationCode()
//         // }
//         const response = await axios.post(`https://accounts.zoho.com/oauth/v2/token`, null, {
//             params: {
//                 refresh_token: ZOHO_REFRESH_TOKEN,
//                 client_id: ZOHO_CLIENT_ID,
//                 client_secret: ZOHO_CLIENT_SECRET,
//                 grant_type: 'refresh_token',
//             },
//         });
//         accessToken = response.data.access_token;
//         console.log('Access Token Refreshed:', accessToken);
//     } catch (error) {
//         console.error('Error refreshing access token:', error.response?.data || error.message);
//     }
// };




app.post('/chat', async (req, res) => {
    const sessionId = `session-${Date.now()}`;
    const sessionPath = sessionClient.projectAgentSessionPath('chitti-moob', sessionId);
    const request = {
      session: sessionPath,
      queryInput: { text: { text: req.body.message, languageCode: 'en' } },
    };
  
    const responses = await sessionClient.detectIntent(request);
    res.json({ reply: responses[0].queryResult.fulfillmentText });
  });


app.get('/leave-balance', async (req, res) => {
    // const url = `https://people.zoho.com/people/api/forms/leave/getbalance?employeeId=286`;
    const url=`https://people.zoho.com/people/api/v2/leavetracker/reports/bookedAndBalance?employeeId=286&from=01-Jan-2025&to=14-Jan-2025&unit=Day`
        try {
            // Check if access token is expired and refresh if necessary
            if (!accessToken) {
                console.log('Access token is missing. Refreshing...');
                await exchangeAuthorizationCode();
            }
            // Fetch leave balance
            // accessToken="1000.29c4ca8fb91879f12730b901ae9425cb.99193b92c0e0175a52faced3d9c07165"
            console.log(accessToken,"access Token in leave Balance")
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Zoho-oauthtoken ${accessToken}`,
                    // 'Content-Type': 'application/json',
                },
            });
    
            // Return the relevant part of the response
            console.log(res, "response from the api")
            res.status(200).json(response.data);
            
            console.log(response.data, "final response")
            // res.json({ balance: response.data });
        } catch (error) {
            console.error('Error fetching leave balance:', error.response?.data || error.message);
            res.status(500).json({ error: 'Failed to fetch leave balance from Zoho.' });
        }
    
})
app.use((req, res, next) => {
    console.log(`${req.method} request made to ${req.url}`);
    next();
});
app.post('/webhook', async (req, res) => {
    const intent = req.body.queryResult.intent.displayName;
    console.log(intent,"intent")
    switch (intent) {
        case 'Leave Balance':
            // Fetch leave balance from Zoho
            const leaveBalance = await getLeaveBalance();
            res.json({ fulfillmentText: `Your leave balance is ${leaveBalance}` })
            // const leaveBalance = await getLeaveBalance(req.body.session);
            // res.json({ fulfillmentText: `Your leave balance is ${leaveBalance}` });
            break;

        case 'Apply Leave':
            // Apply leave via Zoho
            const leaveStatus = await applyLeave(req.body.queryResult.parameters);
            res.json({ fulfillmentText: leaveStatus });
            break;

        case 'Holidays':
            // Fetch holiday list
            const holidays = await getHolidayList();
            res.json({ fulfillmentText: `Here are the holidays: ${holidays}` });
            break;

        case 'Office Conduct Code':
            // Provide a document link
            res.json({ fulfillmentText: 'Here is the office conduct code document: <URL>' });
            break;

        default:
            res.json({ fulfillmentText: 'Sorry, I could not process your request.' });
    }
});

async function getLeaveBalance(session) {
    // Mock Zoho API call
    const url=`https://people.zoho.com/people/api/v2/leavetracker/reports/bookedAndBalance?employeeId=286&from=01-Jan-2025&to=14-Jan-2025&unit=Day`
        try {
            // Check if access token is expired and refresh if necessary
            if (!accessToken) {
                console.log('Access token is missing. Refreshing...');
                await exchangeAuthorizationCode();
            }
            // Fetch leave balance
            // accessToken="1000.29c4ca8fb91879f12730b901ae9425cb.99193b92c0e0175a52faced3d9c07165"
            console.log(accessToken,"access Token in leave Balance")
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Zoho-oauthtoken ${accessToken}`,
                    // 'Content-Type': 'application/json',
                },
            });
    
            // Return the relevant part of the response
            // console.log(json(response.data), "response from the api")
            // json(response.data);
            
            console.log(response.data, "final response")
            // res.json({ balance: response.data });
        } catch (error) {
            console.error('Error fetching leave balance:', error.response?.data || error.message);
            response.status(500).json({ error: 'Failed to fetch leave balance from Zoho.' });
        }
    
    // return '12 days'; // Replace with actual API call
}

async function applyLeave(parameters) {
    // Mock Zoho API call
    return 'Your leave has been applied successfully!'; // Replace with actual API call
}

async function getHolidayList() {
    // Mock Zoho API call
    return 'New Year, Independence Day, Christmas'; // Replace with actual API call
}



const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
