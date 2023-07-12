import Link from 'next/link';

import RecentGroups from '@/components/index/RecentGroups';
import { HomeLayout } from '@/layouts/HomeLayout';
import { Meta } from '@/layouts/Meta';

const Index = () => {
  return (
    <>
      <Meta
        title="GroupShare"
        description="Application for sharing group expenses"
      />
      <HomeLayout>
        <div className="flexbox-col space-y-4">
          <header className="text-center">
            <h1 className="text-3xl">Welcome to GroupShare!</h1>
            <h2 className="text-2xl">
              Effortless Group Expense Management Made Easy
            </h2>
          </header>
          <section className="p-3">
            <h3 className="text-center text-alice-accent">
              Simplify Your Group Expenses
            </h3>
            <p className="text-center">
              {`Tired of endless back-and-forth conversations about who paid for
            what? Our powerful expense splitting tool takes the stress out of
            sharing costs. Whether you're organizing a trip, throwing a party,
            or simply splitting the rent, GroupShare has got you
            covered.`}
            </p>
          </section>
          <div className="w-full p-2">
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

          <section className="p-3">
            <h3 className="text-2xl text-alice-accent">How It Works</h3>
            <ol>
              <li>
                Create an Event: Start by setting up an event and inviting
                participants. You can customize the event name, date, and
                description to suit your needs.
              </li>
              <li>
                {`Add Expenses: As expenses accumulate, easily log them in our
              user-friendly interface. Specify the amount, category, and
              participants involved. We'll take care of the rest!`}
              </li>
              <li>
                Split & Settle: With just a few clicks, our intelligent
                algorithm calculates the fairest way to split the expenses. You
                can choose from various splitting methods, including equal,
                percentage-based, or custom splits.
              </li>
              <li>
                Track Debts: Our interactive dashboard allows you to monitor who
                owes what, keeping everyone accountable. You can also send
                friendly reminders and notifications to ensure timely
                settlements.
              </li>
            </ol>
          </section>

          <section className="p-3">
            <h3 className="text-2xl text-alice-accent">
              Features That Simplify Your Life
            </h3>
            <ul>
              <li>
                Real-Time Updates: Stay up-to-date with live updates on expense
                additions, modifications, and settlements.
              </li>
              <li>
                Multi-Currency Support: No matter where your group adventure
                takes you, our platform supports multiple currencies for
                seamless global transactions.
              </li>
              <li>
                Receipt Uploads: Easily attach receipts to expenses for a clear
                record of your financial transactions.
              </li>
              <li>
                Secure and Private: We prioritize your data privacy and use
                industry-standard security measures to safeguard your
                information.
              </li>
            </ul>
          </section>

          <section className="p-3">
            <h3 className="text-2xl text-alice-accent">
              Join Our Growing Community
            </h3>
            <p>
              {`Become a part of our ever-expanding community of users who have
            embraced a stress-free way to split expenses. Whether you're
            traveling, hosting events, or managing shared living expenses, [Your
            Website Name] is here to simplify your financial journey.`}
            </p>
          </section>

          <section className="p-3">
            <h3 className="text-2xl text-alice-accent">Get Started Today!</h3>
            <p>
              Start organizing your expenses, splitting bills, and maintaining
              financial harmony. Create a group and experience the convenience
              of effortless group expense management.
            </p>
          </section>

          <div className="w-full p-2">
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
