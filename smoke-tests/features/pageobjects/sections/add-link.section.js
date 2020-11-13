const Section = require("./section");

class AddLinkSection extends Section {
  get parent() {
    return $(".flyout-menu-container");
  }

  get fromSelectList() {
    return this.parent.$("#link-source");
  }

  get toSelectList() {
    return this.parent.$("#link-target");
  }

  get deleteBtn() {
    return $(".govuk-button=Delete");
  }

  selectFromByName(name) {
    this.fromSelectList.selectByVisibleText(name);
  }

  selectToByName(name) {
    this.toSelectList.selectByVisibleText(name);
  }

  linkPages(fromPage, toPage) {
    this.selectFromByName(fromPage);
    this.selectToByName(toPage);
    this.saveBtn.click();
  }
}

module.exports = new AddLinkSection();