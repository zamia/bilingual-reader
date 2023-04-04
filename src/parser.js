import Parser from '@postlight/parser';

export default {
  async parse() {
    const result = await Parser.parse();
    return result;
  }
}