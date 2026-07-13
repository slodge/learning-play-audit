/**
 * main page object containing all methods, selectors and functionality
 * that is shared across all page objects
 */
class Client {
  get root() {
    return $(".App");
  }

  navMenuLink(itemText) {
    return $(".nav-menu").$(".nav-menu-item*=" + itemText);
  }

  textArea(id) {
    return $('div[id="' + id + '"] textarea');
  }

  improvementTextArea(id, index) {
    return $$('div[id="' + id + '"] div.text-improvement')[index - 1].$("textarea");
  }

  yearTextArea(id, index) {
    return $$('div[id="' + id + '"] div.text-year')[index - 1].$("input");
  }

  get submitSurveyButton() {
     return $('button.submit-survey');
  }


  questionScale(id, value) {
    return $('div[id="' + id + '"] button[value="' + value + '"]');
  }

  questionUserType(id, value) {
    return $('div[id="' + id + '"] button[value="' + value + '"]');
  }

  questionUserTypeComment(id, value) {
    return $('div[id="' + id + '"] input');
  }

  questionCommentButton(id) {
    return $('div[id="' + id + '"] button[aria-label="show comment"]');
  }

  questionCommentTextArea(id) {
    return $('div[id="' + id + '"] textarea');
  }

  get sitemapLinkAboutUs() {
    return $(".sitemap-container").$("a.link=About Us");
  }

  get sitemapLinkAccessibility() {
    return $(".sitemap-container").$("a.link=Accessibility");
  }

  get sitemapLinkDataSources() {
    return $(".sitemap-container").$("a.link=Data Sources");
  }

  get sitemapLinkRegionalInsights() {
    return $(".sitemap-container").$("a.link=Regional Insights");
  }

  get sitemapLinkSummaryDashboard() {
    return $(".sitemap-container").$("a.link=Summary Dashboard");
  }

  get navbarLinkRegionalInsights() {
    return $(".dashboard-navbar").$(".nav-link=Regional Insights");
  }

  get navbarLinkSummaryDashboard() {
    return $(".dashboard-navbar").$(".nav-link=Summary Dashboard");
  }

  get navbarLinkLogo() {
    return $(".dashboard-navbar").$("#logo");
  }

  open(path = "/index.html") {
    return browser.url(path);
  }
}

export default new Client();
