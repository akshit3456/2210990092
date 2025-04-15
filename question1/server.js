const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;

const numberWindow = {
  p: [],
  f: [],
  e: [],
  r: [],
};

const apiEndpoints = {
  p: 'http://20.244.56.144/evaluation-service/primes',
  f: 'http://20.244.56.144/evaluation-service/fibo',
  e: 'http://20.244.56.144/evaluation-service/even',
  r: 'http://20.244.56.144/evaluation-service/rand',
};

app.get('/numbers/:numberid', async (req, res) => {
  const { numberid } = req.params;

  if (!apiEndpoints[numberid]) {
    return res.status(400).json({ error: 'Invalid number ID. Use p, f, e, or r.' });
  }

  const prevWindow = [...numberWindow[numberid]];
  let fetchedNumbers = [];

  try {
    // 🔧 Increase timeout to 1000ms for testing
    const response = await axios.get(apiEndpoints[numberid], {
        timeout: 1000,
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ0NzAyNjAwLCJpYXQiOjE3NDQ3MDIzMDAsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjNhZDVmOWE4LTdhOTAtNDI1ZS05MjcwLTEyM2U4MTRhYzRkYiIsInN1YiI6ImFrc2hpdDkyLmJlMjJAY2hpdGthcmEuZWR1LmluIn0sImVtYWlsIjoiYWtzaGl0OTIuYmUyMkBjaGl0a2FyYS5lZHUuaW4iLCJuYW1lIjoiYWtzaGl0IGthbnNhbCIsInJvbGxObyI6IjIyMTA5OTAwOTIiLCJhY2Nlc3NDb2RlIjoiUHd6dWZHIiwiY2xpZW50SUQiOiIzYWQ1ZjlhOC03YTkwLTQyNWUtOTI3MC0xMjNlODE0YWM0ZGIiLCJjbGllbnRTZWNyZXQiOiJ5emRXRkpUVENwQnpOcUJhIn0.bGf37BIAP4iYIAST7h71vO-sE1JVkgFWshXOJi9my74'
        }
      });
      
  
    if (response.data?.numbers && Array.isArray(response.data.numbers)) {
      fetchedNumbers = response.data.numbers;
      console.log(`Fetched numbers from '${numberid}':`, fetchedNumbers); 
    }
  } catch (err) {
    console.log(` Error fetching from ${numberid}:`, err.message);
    fetchedNumbers = [];
  }
  

  // Remove duplicates: merge previous + new unique numbers
  const currSet = new Set(prevWindow);
  const newUnique = [];

  for (const num of fetchedNumbers) {
    if (!currSet.has(num)) {
      newUnique.push(num);
      currSet.add(num);
    }
  }

  // Sliding window: append new numbers, then trim to window size
  const updatedWindow = [...prevWindow, ...newUnique].slice(-WINDOW_SIZE);
  numberWindow[numberid] = updatedWindow;

  const sum = updatedWindow.reduce((acc, val) => acc + val, 0);
  const avg = updatedWindow.length > 0 ? parseFloat((sum / updatedWindow.length).toFixed(2)) : 0.0;

  res.json({
    windowPrevState: prevWindow,
    windowCurrState: updatedWindow,
    numbers: fetchedNumbers,
    avg
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});