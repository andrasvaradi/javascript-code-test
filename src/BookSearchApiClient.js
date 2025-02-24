class BookSearchApiClient {
  constructor(baseURL, format = 'json') {
    this.baseURL = baseURL;
    this.format = format;

    this.parsers = {
      json: this.parseJSON.bind(this),
      xml: this.parseXML.bind(this),
      // csv: this.parseCSV.bind(this), // Example for another format
    };
  }

  /**
   * Fetches books by author from the API.
   * @param {string} authorName - The author's name to search for.
   * @param {number} [limit=10] - The maximum number of books to return.
   * @returns {Promise<Array>} - A promise resolving to an array of book objects.
   */
  async getBooksByAuthor(authorName, limit = 10) {
    try {
      const response = await fetch(`${this.baseURL}/by-author?q=${authorName}&limit=${limit}&format=${this.format}`);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const rawData = await response.text();
      const parser = this.parsers[this.format];

      if (!parser) {
        throw new Error(`Unsupported format: ${this.format}`);
      }

      const data = await parser(rawData);
      return this.normaliseData(data);
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  }

  /**
   * Parses JSON string into an object.
   * @param {string} jsonString - The JSON string to parse.
   * @returns {Promise<Array>} - Parsed JSON data.
   */
  async parseJSON(jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error(`JSON Parsing Error: ${error.message}`);
    }
  }

  /**
   * Parses XML string into an array of book objects.
   * @param {string} xmlString - Raw XML response from the API.
   * @returns {Promise<Array>} - Parsed array of books.
   * Note: DOMParser is browser-native. Use xmldom for Node.js
   */
  async parseXML(xmlString) {
    try {
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlString, 'application/xml');
      return [...xml.getElementsByTagName('book')].map((bookNode) => ({
        title: bookNode.getElementsByTagName('title')[0]?.textContent,
        author: bookNode.getElementsByTagName('author')[0]?.textContent,
        isbn: bookNode.getElementsByTagName('isbn')[0]?.textContent,
        quantity: bookNode.getElementsByTagName('quantity')[0]?.textContent,
        price: bookNode.getElementsByTagName('price')[0]?.textContent,
      }));
    } catch (error) {
      throw new Error(`XML Parsing Error: ${error.message}`);
    }
  }

  // // Example for another format
  // async parseCSV(csvString) {
  //   try {
  //     const lines = csvString.split('\n').filter(line => line.trim() !== '');

  //     // Assuming the first line is the header and skipping it
  //     const dataLines = lines.slice(1);

  //     return dataLines.map(line => {
  //       const [title, author, isbn, quantity, price] = line.split(',').map(value => value.trim());

  //       return {
  //         title,
  //         author,
  //         isbn,
  //         quantity: Number(quantity), // Convert quantity to a number
  //         price: parseFloat(price),   // Convert price to a float
  //       };
  //     });
  //   } catch (error) {
  //     throw new Error(`CSV Parsing Error: ${error.message}`);
  //   }
  // }

  /**
   * normalises API response to a consistent format.
   * @param {Array} data - Raw data from API.
   * @returns {Array} - normalised book objects.
   */
  normaliseData(data) {
    return data.map((item) => ({
      title: item.title,
      author: item.author,
      isbn: item.isbn,
      quantity: item.quantity,
      price: item.price,
    }));
  }
}

module.exports = BookSearchApiClient;
