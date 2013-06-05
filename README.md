ynab-extensions
===============

YNAB (<http://www.youneedabudget.com>) is a great budgeting software that I've been using for almost a year. However, as I am a big fan of graphs, I was interested in complementing YNAB's functionality with more varied reporting. 

ynab-extensions is a web application that imports budgets and registers exported from YNAB as csv files. It displays several types of charts and some statistics on the input. 

### Installation

Clone the git repo and open Web/client/html/index.html in FireFox directly off of the filesystem. 

### Usage

Use YNAB to export your register and budget, this will generate two csv files. 

Load ynab-extensions and use the two "Browse" buttons to point to your budget and register files, respectively. 

Click "Load." 

You can select a month from the drop-down to change the charts generated. 

Below is a list of reports that get generated: 

#### Progress towards current budget allocations for a given month: 
![ScreenShot](https://raw.github.com/cefolger/ynab-extensions/master/Web/docs/budgetprogress.jpg)

#### Amount allocated to each master category: 
![ScreenShot](https://raw.github.com/cefolger/ynab-extensions/master/Web/docs/allocations.jpg)

#### Category balances over time:
![ScreenShot](https://raw.github.com/cefolger/ynab-extensions/master/Web/docs/categorybalancesovertime.jpg)

#### Cumulative spending: 
![ScreenShot](https://raw.github.com/cefolger/ynab-extensions/master/Web/docs/cumulativespending.jpg)

#### Outflows as a percentage of total income:
![ScreenShot](https://raw.github.com/cefolger/ynab-extensions/master/Web/docs/outflowstotalincome.jpg)

#### Spending over time for master categories
![ScreenShot](https://raw.github.com/cefolger/ynab-extensions/master/Web/docs/spendingovertime.jpg)
