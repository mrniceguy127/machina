'use-strict';

// Override!
class Book {
  constructor(pageSize = 10) {
    this.__pageSize = pageSize;
  }

  // Override!
  getLength() {
    return 0;
  }

  // Override!
  getItems() {
    return [];
  }

  getPageSize() {
    return this.__pageSize;
  }

  setPageSize(size) {
    this.__pageSize = size;
  }

  getMaxPage() {
    let maxPage = Math.floor((this.getLength() - 1) / this.getPageSize()) + 1; // Flooring for integer division. Add one for page.

    return maxPage;
  }

  doesPageExceedMax(page) {
    return page > this.getMaxPage();
  }

  // Get what index in the queue the page should start from.
  getPageQueueStartIndex(page) {
    const queueLength = this.getLength();

    const queueSliceStart = (page - 1) * this.getPageSize();

    return queueSliceStart;
  }


  // Get page items to display
  // queue: The guild's music queue from client globals.
  // page: Page number for the items you want to display.
  getPageItems(page) {
    let queueSliceStart = this.getPageQueueStartIndex(page);
    let queueSliceEnd = queueSliceStart + this.getPageSize();

    const pageItems = this.getItems().slice(queueSliceStart, queueSliceEnd);

    return pageItems;
  }

  // Ensure page is number, at least 1, does not exceed max page.
  // page: Page number to validate.
  getValidPage(page) {
    let validPage = page;

    if (isNaN(validPage) || validPage < 1) {
      validPage = 1;
    }

    if (this.doesPageExceedMax(validPage)) {
      validPage = this.getMaxPage();
    }

    return validPage;
  }
};

module.exports = Book;
