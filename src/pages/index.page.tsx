import Link from 'next/link';
import Balancer from 'react-wrap-balancer';

import RecentGroups from '@/components/index/RecentGroups';
import { HomeLayout } from '@/layouts/HomeLayout';
import { Meta } from '@/layouts/Meta';

const Index = () => {
  return (
    <>
      <Meta
        title="ShareCost"
        description="Effortless Expense Sharing with ShareCost | Split bills, manage group finances, and simplify multi-currency expenses.
        No registration required. Explore receipt scanning and automated currency conversion"
      />
      <HomeLayout>
        <div className="flexbox-col space-y-4">
          <header className="text-center">
            <h1 className="text-4xl">Welcome to ShareCost!</h1>
          </header>
          <section className="p-1 md:p-3">
            <h1 className="text-center text-2xl text-alice-accent">
              Simplify the process of splitting expenses
            </h1>
            <p className="text-center">
              <Balancer className="p-2">
                Say goodbye to the headaches of splitting bills and managing
                group expenses. Effortlessly track and settle shared expenses
                among friends, roommates, or colleagues.
              </Balancer>
            </p>
          </section>
          <div className="w-full p-1 md:p-3">
            <Link href="/new-group" passHref>
              <button
                className="w-full rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md"
                type="button"
              >
                Get Started
              </button>
            </Link>
          </div>

          <RecentGroups />

          <section className="p-1 md:p-3">
            <h1 className="text-2xl text-alice-accent">
              How to use ShareCost?
            </h1>
            <ul className="flexbox-col list-decimal space-y-2 px-6">
              <li className="">
                <h3 className="text-xl">Create a Group</h3>
                <ul className="flexbox-col list-disc space-y-2 px-4">
                  <li>
                    Start by creating a new group for friends, family, or
                    colleagues.
                  </li>
                  <li>
                    Name the group, set the main currency, and add members.
                  </li>
                </ul>
              </li>
              <li>
                <h3 className="text-xl">Share the Group Link</h3>
                <ul className="flexbox-col list-disc space-y-2 px-4">
                  <li>Copy the group URL and share it with your friends.</li>
                  <li>
                    Anyone with the link can add expenses to the group, no
                    registration required.
                  </li>
                </ul>
              </li>
              <li>
                <h3 className="text-xl">Add Expenses</h3>
                <ul className="flexbox-col list-disc space-y-2 px-4">
                  <li>
                    Simply create a transaction from the group page for any
                    shared expense.
                  </li>
                  <li>
                    Input the item amount, description, payer, date, and
                    expense-splitting preferences.
                  </li>
                </ul>
              </li>
              <li>
                <h3 className="text-xl">Review Debts</h3>
                <ul className="flexbox-col list-disc space-y-2 px-4">
                  <li>
                    {`Visit the group page to see everyone's owed amounts and
                    debts to be settled.`}
                  </li>
                </ul>
              </li>
            </ul>
          </section>

          <section className="md:p-3">
            <h1 className="text-2xl text-alice-accent">ShareCost features</h1>
            <ul className="flexbox-col space-y-6 px-1 pt-2">
              <li className="">
                <h3 className="rounded bg-alice-main p-2 text-xl">
                  No Account Registration or Installation Required:
                </h3>
                <ul className="flexbox-col list-disc space-y-2 px-8 pt-2">
                  <li>
                    Enjoy hassle-free access without providing personal
                    information.
                  </li>
                  <li>
                    Simply use ShareCost via any browser with an internet
                    connection.
                  </li>
                </ul>
              </li>
              <li>
                <h3 className="rounded bg-alice-main p-2 text-xl">
                  Comments Section
                </h3>
                <ul className="flexbox-col list-disc space-y-2 px-8 pt-2">
                  <li>
                    Engage with your group members through the built-in comments
                    section.
                  </li>
                  <li>
                    Chat, discuss expenses, and store random notes conveniently.
                  </li>
                </ul>
              </li>
              <li>
                <h3 className="rounded bg-alice-main p-2 text-xl">
                  History section
                </h3>
                <ul className="flexbox-col list-disc space-y-2 px-8 pt-2">
                  <li>
                    Track all group activity in the history page for easy
                    reference.
                  </li>
                  <li>
                    Recover from accidentally deleted expenses and review edits
                    made.
                  </li>
                </ul>
              </li>
              <li>
                <h3 className="rounded bg-alice-main p-2 text-xl">
                  Support for 150+ Currencies
                </h3>
                <ul className="flexbox-col list-disc space-y-2 px-8 pt-2">
                  <li>
                    {`Experience smooth expense tracking in your group's chosen
                    main currency.`}
                  </li>
                  <li>
                    Upgrade to unlock automatic currency conversion for
                    multi-currency expenses.
                  </li>
                  <li>
                    Ideal for international trips and diverse spending with
                    friends.
                  </li>
                </ul>
              </li>
              <li>
                <h3 className="rounded bg-alice-main p-2 text-xl">
                  Export Expenses to Excel:
                </h3>
                <ul className="flexbox-col list-disc space-y-2 px-8 pt-2">
                  <li>
                    {`Easily export your group's expenses and paid debts to Excel
                    format.`}
                  </li>
                  <li>
                    Simplify financial tracking and reporting for your records.
                  </li>
                </ul>
              </li>
              <li>
                <h3 className="rounded bg-alice-main p-2 text-xl">
                  Automated Currency Conversion (Premium Feature):
                </h3>
                <ul className="flexbox-col list-disc space-y-2 px-8 pt-2">
                  <li>
                    Upgrade your group to enable automatic currency conversion.
                  </li>
                  <li>
                    {`Add expenses in multiple currencies, automatically converted
                    to your group's main currency based on the exchange rates
                    from the transaction date.`}
                  </li>
                </ul>
              </li>
              <li>
                <h3 className="rounded bg-alice-main p-2 text-xl">
                  Receipt Scanning (Premium Feature/ Work in Progress):
                </h3>
                <ul className="flexbox-col list-disc space-y-2 px-8 pt-2">
                  <li>Upgrade your group to use receipt scanning feature.</li>
                  <li>
                    Upload a receipt image, and the app will do its best to
                    extract the expenses for editing
                  </li>
                  <li>Demo is available in the options dropdown menu.</li>
                </ul>
              </li>
            </ul>
          </section>

          <section className="p-1 md:p-3">
            <h3 className="text-2xl text-alice-accent">Get Started Today!</h3>
            <p>
              <Balancer className="p-2">
                Start organizing your expenses, splitting bills, and maintaining
                financial harmony. Create a group and experience the convenience
                of effortless group expense management.
              </Balancer>
            </p>
          </section>

          <div className="w-full p-1 md:p-3">
            <Link href="/new-group" passHref>
              <button
                className="w-full rounded bg-alice-accent p-2 px-3 text-alice-base shadow-md"
                type="button"
              >
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </HomeLayout>
    </>
  );
};

export default Index;
