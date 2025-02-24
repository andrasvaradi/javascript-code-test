// bookSearchApiClient.js

/**
 * Main function to fetch books by author using a functional approach.
 * @param {Object} params - The parameters for the request.
 * @param {string} params.baseURL - The base API URL.
 * @param {string} params.authorName - The author's name to search for.
 * @param {number} [params.limit=10] - Number of books to return.
 * @param {string} [params.format='json'] - Response format ('json', 'xml', or 'csv').
 * @returns {Promise<Array>} - A promise resolving to an array of normalised book objects.
 */
const fetchBooksByAuthor = async ({ baseURL, authorName, limit = 10, format = 'json' }) => {
  /**
   * Parser Registry
   * Maps formats to corresponding parser functions.
   */
  const parsers = {
    json: parseJSON,
    xml: parseXML,
    csv: parseCSV, // Ready for CSV support
  };

  try {
    const response = await fetch(`${baseURL}/by-author?q=${authorName}&limit=${limit}&format=${format}`);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const rawData = await response.text();

    // Select the appropriate parser
    const parser = parsers[format];
    if (!parser) {
      throw new Error(`Unsupported format: ${format}`);
    }

    const data = await parser(rawData);
    return normaliseData(data);
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

/**
 * JSON Parser
 * @param {string} jsonString - JSON string to parse.
 * @returns {Array} - Parsed JSON data.
 */
const parseJSON = async (jsonString) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`JSON Parsing Error: ${error.message}`);
  }
};

/**
 * XML Parser
 * @param {string} xmlString - XML string to parse.
 * @returns {Array} - Parsed XML data.
 * Note: DOMParser works in browsers. Use xmldom in Node.js.
 */
const parseXML = async (xmlString) => {
  try {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlString, 'application/xml');

    return [...xml.getElementsByTagName('book')].map((bookNode) => ({
      title: bookNode.getElementsByTagName('title')[0]?.textContent,
      author: bookNode.getElementsByTagName('author')[0]?.textContent,
      isbn: bookNode.getElementsByTagName('isbn')[0]?.textContent,
      quantity: Number(bookNode.getElementsByTagName('quantity')[0]?.textContent),
      price: parseFloat(bookNode.getElementsByTagName('price')[0]?.textContent),
    }));
  } catch (error) {
    throw new Error(`XML Parsing Error: ${error.message}`);
  }
};


// // Example for another format
// /**
//  * CSV Parser
//  * @param {string} csvString - CSV string to parse.
//  * @returns {Array} - Parsed CSV data.
//  */
// const parseCSV = async (csvString) => {
//   try {
//     const lines = csvString.split('\n').filter(line => line.trim() !== '');
//     const dataLines = lines.slice(1); // Skip header

//     return dataLines.map(line => {
//       const [title, author, isbn, quantity, price] = line.split(',').map(value => value.trim());
//       return {
//         title,
//         author,
//         isbn,
//         quantity: Number(quantity),
//         price: parseFloat(price),
//       };
//     });
//   } catch (error) {
//     throw new Error(`CSV Parsing Error: ${error.message}`);
//   }
// };


/**
 * Normalises API response to a consistent format.
 * @param {Array} data - Raw data from API.
 * @returns {Array} - Normalised book objects.
 */
const normaliseData = (data) => {
  return data.map((item) => ({
    title: item.title,
    author: item.author,
    isbn: item.isbn,
    quantity: item.quantity,
    price: item.price,
  }));
};

module.exports = fetchBooksByAuthor;
