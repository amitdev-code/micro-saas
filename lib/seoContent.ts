import type { ToolConfig } from './toolsConfig';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ToolSEOContent {
  h1: string;
  intro: string;
  sections: { heading: string; content: string }[];
  faqs: FAQItem[];
}

const seoContent: Record<string, ToolSEOContent> = {
  'sip-calculator': {
    h1: 'SIP Calculator — Calculate Mutual Fund SIP Returns Online',
    intro:
      'A SIP (Systematic Investment Plan) Calculator helps you estimate the future value of your mutual fund investments. By investing a fixed amount every month, you harness the power of compounding to build substantial wealth over time. Use this free calculator to plan your financial goals with confidence.',
    sections: [
      {
        heading: 'What is SIP and How Does It Work?',
        content:
          'SIP is a disciplined investment approach where you invest a fixed sum in mutual funds at regular intervals — usually monthly. Unlike lump-sum investing, SIP averages out the cost of units bought over time (rupee cost averaging), reducing the impact of market volatility. Even small monthly investments of ₹500 or ₹1,000 can grow into significant wealth over 10–20 years due to compounding. The SIP return formula used in this calculator is: FV = P × [(1 + r)^n – 1] / r × (1 + r), where P is the monthly investment, r is the monthly rate of return, and n is the total number of months.',
      },
      {
        heading: 'How to Use This SIP Calculator',
        content:
          'Enter your monthly investment amount (e.g., ₹5,000), the expected annual return rate (typically 10–15% for equity funds), and the investment duration in years. The calculator instantly shows your Total Invested amount, Estimated Returns (profit), and the Total Corpus (maturity value). You can adjust inputs in real time to simulate different scenarios — like increasing your SIP amount or extending the tenure — to see how it impacts your wealth creation.',
      },
      {
        heading: 'Why Start SIP Early?',
        content:
          'The single most powerful factor in SIP investing is time. Starting a ₹5,000/month SIP at age 25 instead of 35 can result in nearly 3x more wealth at retirement, assuming the same 12% returns. This is because your money has more time to compound. A 10-year SIP at 12% returns turns ₹6 lakh of investment into approximately ₹11.6 lakh, while a 20-year SIP turns ₹12 lakh into over ₹50 lakh. This calculator makes it easy to visualize these scenarios and motivate you to start today.',
      },
      {
        heading: 'SIP vs Lump Sum — Which Is Better?',
        content:
          'For salaried individuals with monthly income, SIP is ideal because it automates saving and removes emotional decision-making. Lump-sum investing is better when markets are significantly undervalued and you have a large corpus to deploy. For most retail investors, SIP delivers better risk-adjusted returns because it smooths out market cycles. Financial advisors often recommend SIP for equity funds and lump sum for debt or liquid funds.',
      },
    ],
    faqs: [
      {
        question: 'What is a good expected return rate for SIP?',
        answer:
          'Historically, diversified equity mutual funds in India have delivered 12–15% CAGR over long periods (10+ years). For conservative estimates, use 10–12%. For debt funds, use 6–8%. This calculator uses your input rate, so adjust based on the fund type.',
      },
      {
        question: 'Is SIP return guaranteed?',
        answer:
          'No. SIP returns in equity mutual funds are market-linked and not guaranteed. However, long-term SIPs (7+ years) in diversified funds have historically delivered positive returns. Debt fund SIPs carry lower risk but also lower returns.',
      },
      {
        question: 'Can I stop SIP midway?',
        answer:
          'Yes, you can pause or stop a SIP anytime without penalty (most funds). The invested units remain and continue to grow. Many fund houses allow SIP modification online or through your broker.',
      },
      {
        question: 'What is the minimum amount for SIP?',
        answer:
          'Most mutual funds allow SIP with as little as ₹100 to ₹500 per month. There is no maximum limit. Starting small and increasing your SIP annually (step-up SIP) is a great strategy.',
      },
      {
        question: 'Does this SIP calculator account for tax?',
        answer:
          'No, this calculator shows pre-tax returns. Equity mutual fund gains held over 1 year are taxed at 10% LTCG above ₹1 lakh. Debt fund gains are taxed at your income slab. Consult a tax advisor for exact post-tax returns.',
      },
    ],
  },

  'emi-calculator': {
    h1: 'EMI Calculator — Calculate Loan EMI Instantly Online',
    intro:
      'An EMI (Equated Monthly Installment) Calculator helps you determine the exact monthly payment for any loan — home loan, car loan, personal loan, or education loan. Enter your loan amount, interest rate, and tenure to instantly see your monthly EMI, total interest outgo, and total repayment amount.',
    sections: [
      {
        heading: 'How Is EMI Calculated?',
        content:
          'EMI is calculated using the formula: EMI = P × r × (1+r)^n / [(1+r)^n – 1], where P is the principal loan amount, r is the monthly interest rate (annual rate ÷ 12 ÷ 100), and n is the loan tenure in months. For example, a ₹10 lakh home loan at 8.5% for 20 years results in an EMI of approximately ₹8,678 and total interest paid of over ₹10.8 lakh — meaning you pay more than double the principal over 20 years.',
      },
      {
        heading: 'Types of Loans and Typical Interest Rates',
        content:
          'Home loans in India currently range from 8.5% to 9.5% per annum (2024). Car loans typically range from 7% to 12%. Personal loans carry higher rates of 10%–24% depending on the lender and your credit score. Education loans range from 7% to 15%. This EMI calculator works for all loan types — just enter the applicable interest rate and tenure.',
      },
      {
        heading: 'How to Reduce Your EMI',
        content:
          'Three strategies to lower your EMI: (1) Make a higher down payment to reduce the principal. (2) Negotiate a lower interest rate — even 0.5% reduction on a ₹50 lakh home loan saves ₹1,500+ per month. (3) Extend the loan tenure — though this increases total interest paid. Use this calculator to compare scenarios and find the optimal balance between EMI amount and total cost.',
      },
      {
        heading: 'Part Prepayment and Foreclosure',
        content:
          'Paying a lump sum towards your loan principal (part prepayment) reduces the outstanding balance and therefore future EMIs or tenure. RBI guidelines prohibit banks from charging foreclosure penalties on floating-rate loans. If you receive a bonus or windfall, prepaying your loan can save significantly on interest. Use the EMI calculator to see how your current EMI is structured before planning prepayment.',
      },
    ],
    faqs: [
      {
        question: 'What is the difference between flat rate and reducing balance EMI?',
        answer:
          'In flat rate interest, interest is charged on the full principal throughout the tenure. In reducing balance (which most banks use), interest is charged only on the outstanding principal. Reducing balance results in lower effective interest. This calculator uses the reducing balance method.',
      },
      {
        question: 'Can I get a lower EMI with a longer tenure?',
        answer:
          'Yes. Extending the tenure reduces the monthly EMI but significantly increases total interest paid. For example, a ₹30 lakh loan at 9% for 15 years has EMI of ₹30,428, but for 25 years the EMI drops to ₹25,165 — while total interest jumps from ₹24.7 lakh to ₹45.5 lakh.',
      },
      {
        question: 'Does my credit score affect EMI?',
        answer:
          'Credit score affects the interest rate offered, not the EMI formula. A higher credit score (750+) typically gets you lower interest rates, which directly reduces your EMI. Improving your credit score before applying for a loan can save lakhs over the tenure.',
      },
      {
        question: 'Is EMI tax deductible?',
        answer:
          'For home loans, the principal component of EMI qualifies for deduction under Section 80C (up to ₹1.5 lakh), and the interest component under Section 24(b) (up to ₹2 lakh for self-occupied property). Personal and car loan EMIs are generally not tax deductible.',
      },
      {
        question: 'What happens if I miss an EMI?',
        answer:
          'Missing an EMI results in a penalty (typically 1–2% of overdue amount), damages your credit score, and may lead to loan default if repeated. Most lenders allow a grace period of a few days. Contact your lender immediately if you anticipate difficulty paying an EMI.',
      },
    ],
  },

  'fd-calculator': {
    h1: 'FD Calculator — Calculate Fixed Deposit Maturity Amount',
    intro:
      'A Fixed Deposit (FD) Calculator helps you find out how much your deposit will grow by maturity. Enter your principal amount, interest rate, tenure, and compounding frequency to instantly calculate the maturity value and total interest earned on your FD.',
    sections: [
      {
        heading: 'How Is FD Interest Calculated?',
        content:
          'FD interest is calculated using compound interest: A = P × (1 + r/n)^(nt), where A is the maturity amount, P is the principal, r is the annual interest rate, n is the compounding frequency per year, and t is the tenure in years. For a ₹1 lakh FD at 7% for 5 years compounded quarterly, the maturity amount is approximately ₹1,41,478 — earning ₹41,478 as interest.',
      },
      {
        heading: 'FD Interest Rates in India (2024)',
        content:
          'Major banks like SBI, HDFC, ICICI, and Axis offer FD rates between 6.5% and 7.5% for general customers. Senior citizens typically receive 0.25%–0.5% additional interest. Small finance banks and NBFCs offer higher rates of 8%–9.5%, though they carry slightly more risk. Compare rates and use this calculator to find the best option for your savings goal.',
      },
      {
        heading: 'Types of Fixed Deposits',
        content:
          'Regular FD offers flexible tenures from 7 days to 10 years. Tax-saving FD has a mandatory 5-year lock-in and qualifies for Section 80C deduction up to ₹1.5 lakh. Cumulative FD reinvests interest until maturity (higher returns). Non-cumulative FD pays interest periodically (monthly, quarterly) — suited for regular income needs.',
      },
      {
        heading: 'Is FD the Best Investment Option?',
        content:
          'FD is ideal for risk-averse investors, emergency funds, short-term goals (1–5 years), and senior citizens needing regular income. However, FD returns are fully taxable and often barely beat inflation after tax. For long-term goals (7+ years), equity mutual fund SIPs typically outperform FDs significantly. A balanced portfolio includes both FD for stability and mutual funds for growth.',
      },
    ],
    faqs: [
      {
        question: 'Is FD interest taxable?',
        answer:
          'Yes. FD interest is added to your total income and taxed at your applicable income tax slab rate. If interest exceeds ₹40,000 per year (₹50,000 for seniors), the bank deducts TDS at 10%. You can submit Form 15G/15H if your income is below the taxable limit to avoid TDS.',
      },
      {
        question: 'Can I break an FD before maturity?',
        answer:
          'Yes, most FDs can be broken prematurely, but the bank charges a penalty of 0.5%–1% on the applicable interest rate. Some banks offer no-penalty premature withdrawal FDs. Breaking an FD should be a last resort as it reduces your effective returns.',
      },
      {
        question: 'Which is better — monthly or quarterly compounding?',
        answer:
          'More frequent compounding results in slightly higher returns. Monthly compounding gives marginally better returns than quarterly, and quarterly beats half-yearly and annual. The difference is small for short tenures but becomes meaningful for longer periods.',
      },
      {
        question: 'What is the DICGC insurance on FDs?',
        answer:
          'The Deposit Insurance and Credit Guarantee Corporation (DICGC) insures bank deposits up to ₹5 lakh per depositor per bank. This covers savings, FD, RD, and current accounts combined. For amounts above ₹5 lakh, consider spreading across multiple banks.',
      },
      {
        question: 'How does FD compare to PPF?',
        answer:
          'PPF (Public Provident Fund) currently offers ~7.1% interest, which is tax-free and EEE (exempt-exempt-exempt). FD interest is fully taxable. PPF has a 15-year lock-in vs FD\'s flexible tenure. For tax-saving, PPF beats FD for investors in the 20%–30% tax bracket.',
      },
    ],
  },

  'gst-calculator': {
    h1: 'GST Calculator — Calculate GST Amount Online for Free',
    intro:
      'The GST Calculator helps businesses, freelancers, and consumers instantly calculate the Goods and Services Tax for any product or service. Whether you need to find GST on an exclusive price or extract GST from an inclusive amount, this tool handles all GST slabs — 5%, 12%, 18%, and 28%.',
    sections: [
      {
        heading: 'Understanding GST Slabs in India',
        content:
          'India\'s GST structure has four main rate slabs: 5% (essential goods — unbranded food, economy hotels, transport), 12% (processed food, computers, medicines), 18% (most services including restaurants, telecom, IT services, FMCG), and 28% (luxury goods, cars, tobacco, aerated drinks). Some items like unprocessed food grains, fresh vegetables, and educational services are exempt (0% GST). A few items like gold and silver carry 3% GST.',
      },
      {
        heading: 'GST Exclusive vs GST Inclusive — What\'s the Difference?',
        content:
          'GST Exclusive means the stated price does NOT include GST, and GST is added on top. This is common in B2B transactions. For example, if a service costs ₹1,000 exclusive of 18% GST, the total invoice amount is ₹1,180. GST Inclusive means the stated price ALREADY includes GST. In this case, the base price is back-calculated: Base = Total × 100 / (100 + GST%). For ₹1,180 inclusive of 18% GST, the base price is ₹1,000.',
      },
      {
        heading: 'CGST, SGST, and IGST — How GST Is Split',
        content:
          'For intra-state transactions, GST is split equally into CGST (Central GST) and SGST (State GST). For 18% GST, it becomes 9% CGST + 9% SGST. For inter-state transactions, IGST (Integrated GST) applies at the full rate — 18% IGST instead of 9+9. This matters for invoicing: intra-state invoices must show CGST and SGST separately, while inter-state invoices show IGST.',
      },
      {
        heading: 'GST Input Tax Credit (ITC)',
        content:
          'Businesses registered under GST can claim Input Tax Credit — the GST paid on purchases can be offset against GST collected on sales, reducing the net GST liability. This eliminates the cascading tax effect. ITC is available only on business purchases, not personal expenses. Proper GST-compliant invoices from registered suppliers are required to claim ITC.',
      },
    ],
    faqs: [
      {
        question: 'Who needs to register for GST?',
        answer:
          'Businesses with annual turnover above ₹40 lakh (₹20 lakh for service providers, ₹10 lakh in special category states) must register for GST. E-commerce sellers and inter-state suppliers must register regardless of turnover.',
      },
      {
        question: 'What is the GST rate for restaurants?',
        answer:
          'AC restaurants charge 5% GST (no ITC). Non-AC restaurants also charge 5%. Hotels with room tariff above ₹7,500/night charge 18% on food. Outdoor catering charges 18% GST. Zomato and Swiggy collect 5% GST on restaurant services.',
      },
      {
        question: 'How to calculate GST on a ₹10,000 invoice?',
        answer:
          'For 18% GST exclusive: GST = ₹10,000 × 18% = ₹1,800. Total = ₹11,800. For 18% GST inclusive: Base = ₹10,000 × 100/118 = ₹8,474.58. GST = ₹10,000 – ₹8,474.58 = ₹1,525.42.',
      },
      {
        question: 'What is Reverse Charge Mechanism (RCM)?',
        answer:
          'Under RCM, the buyer pays GST instead of the supplier. This applies when buying from unregistered suppliers above a threshold, or for specific services like legal fees, goods transport agency, etc. The buyer can claim ITC on RCM paid.',
      },
      {
        question: 'Is GST applicable on exports?',
        answer:
          'Exports are zero-rated under GST. Exporters can either export under Bond/LUT without paying IGST and claim ITC refund, or pay IGST and claim a refund. This makes Indian exports competitive globally.',
      },
    ],
  },

  'discount-calculator': {
    h1: 'Discount Calculator — Calculate Discounted Price Instantly',
    intro:
      'The Discount Calculator helps you quickly find the final price after applying any percentage discount. Whether you\'re shopping online, calculating trade discounts, or comparing sale prices, this tool instantly shows the discount amount and the final price you\'ll pay.',
    sections: [
      {
        heading: 'How to Calculate Discount',
        content:
          'The discount formula is straightforward: Discount Amount = Original Price × Discount% ÷ 100. Final Price = Original Price – Discount Amount. For example, a ₹2,000 item with 30% off: Discount = ₹2,000 × 30 ÷ 100 = ₹600. Final price = ₹2,000 – ₹600 = ₹1,400. You save ₹600. This calculator handles any original price and discount percentage combination instantly.',
      },
      {
        heading: 'Types of Discounts in Retail',
        content:
          'Percentage discounts are the most common — "20% off" means you pay 80% of the original price. Flat discounts offer a fixed rupee amount off (e.g., "₹500 off on ₹2,000+"). Buy-one-get-one (BOGO) is effectively a 50% discount per item. Cashback and loyalty point discounts offer savings on future purchases. Coupon codes typically provide 5%–20% additional discount on top of sale prices.',
      },
      {
        heading: 'Stacking Discounts — Does Order Matter?',
        content:
          'When applying multiple discounts sequentially (not additively), order doesn\'t affect the final price. A 20% discount followed by a 10% discount gives the same result as 10% then 20% — both result in 28% effective discount (you pay 80% × 90% = 72% of original). However, if one is a flat discount and another is a percentage, order can affect the final price.',
      },
      {
        heading: 'Smart Shopping with Discount Calculations',
        content:
          'Always compare effective discount percentages, not just headline numbers. A "₹500 off ₹3,000" equals 16.7% discount, while "20% off ₹2,000" saves ₹400 — the flat discount wins here. During sale seasons (Big Billion Days, Republic Day Sales), combine coupon codes with bank offers to maximize savings. Use this calculator to quickly compare offers across different sellers.',
      },
    ],
    faqs: [
      {
        question: 'How do I calculate the original price from a discounted price?',
        answer:
          'If you know the discounted price and the discount percentage: Original Price = Discounted Price ÷ (1 – Discount%/100). For example, if you paid ₹1,400 after a 30% discount: Original = ₹1,400 ÷ 0.70 = ₹2,000.',
      },
      {
        question: 'What is a good discount percentage?',
        answer:
          'For everyday purchases, 10%–20% discounts are standard. Electronics sales often feature 15%–30% discounts. Festival sales can offer 40%–70% on fashion and lifestyle products. End-of-season sales on apparel can reach 50%–80%. Always check if the "original price" is accurate before getting excited by large percentages.',
      },
      {
        question: 'Is there a difference between discount and cashback?',
        answer:
          'A discount reduces the price you pay upfront. Cashback is money returned to you after the purchase — it may have conditions like a minimum transaction amount or cashback credited after 30–90 days. Effective savings are the same if cashback is unconditional.',
      },
      {
        question: 'How to calculate the effective discount when two discounts are applied?',
        answer:
          'For two sequential discounts of d1% and d2%, the effective discount is: 100 – (100 – d1) × (100 – d2) / 100. For 20% + 10%: effective = 100 – 80 × 90 / 100 = 100 – 72 = 28%.',
      },
      {
        question: 'What is a trade discount?',
        answer:
          'Trade discounts are offered by manufacturers/wholesalers to retailers, typically 20%–50% off the MRP (Maximum Retail Price). This allows retailers to sell at MRP while maintaining a profit margin. Trade discounts are not shown on invoices — only the net price is listed.',
      },
    ],
  },

  'age-calculator': {
    h1: 'Age Calculator — Calculate Exact Age from Date of Birth',
    intro:
      'The Age Calculator determines your exact age in years, months, and days from your date of birth. It also shows the total number of days you\'ve lived and how many days remain until your next birthday. Useful for official forms, eligibility checks, and fun personal milestones.',
    sections: [
      {
        heading: 'How Age Is Calculated',
        content:
          'Age calculation involves finding the difference between two dates while accounting for month lengths and leap years. The algorithm first calculates whole years elapsed, then remaining months, then remaining days. February has 28 or 29 days depending on leap years, and months vary between 28 and 31 days — making manual calculation error-prone. This calculator handles all these edge cases accurately using JavaScript\'s date arithmetic.',
      },
      {
        heading: 'Why Exact Age Matters',
        content:
          'Exact age calculation is important for several practical reasons: eligibility for government schemes (many have minimum/maximum age requirements), retirement planning, EPF/NPS maturity, insurance premium calculations, pension eligibility, school admissions (many cut-off dates are April 1 or June 1), and sports competitions with age categories. For legal documents and passports, the age as on a specific date (not just the current date) may be required.',
      },
      {
        heading: 'Age Calculation Across Time Zones',
        content:
          'For most practical purposes, age is calculated based on calendar date without considering time zones. However, if you were born near midnight and need legal precision, the time zone can matter (a birth at 11:55 PM IST vs 11:55 PM EST is different calendar dates). This calculator uses your local browser date, which works correctly for all standard age calculations.',
      },
      {
        heading: 'Fun Age Facts and Milestones',
        content:
          'The average human heart beats about 100,000 times per day — by age 30, that\'s over 1 billion heartbeats. In 1 billion seconds, you turn approximately 31.7 years old. The legal voting age in India is 18, driving age is 18, and marriage registration requires age 21 for men and 18 for women. Senior citizen benefits begin at age 60, and super senior citizen tax benefits kick in at 80.',
      },
    ],
    faqs: [
      {
        question: 'How do I calculate age for a specific date (not today)?',
        answer:
          'This calculator computes age as of today. For age on a specific past or future date, you would need to enter the reference date. A common use case is "age on date of exam/interview" — you can use the same formula: Reference Date – Date of Birth.',
      },
      {
        question: 'What is the minimum age for opening a bank account in India?',
        answer:
          'Minors under 10 years can have a joint account with a guardian. Children 10–18 can open a minor savings account independently. A full-fledged savings account requires age 18+. KYC-compliant accounts require 18+ with valid identity proof.',
      },
      {
        question: 'How does this calculator handle leap years?',
        answer:
          'The calculator uses JavaScript\'s native Date object, which correctly handles leap years (years divisible by 4, except centuries not divisible by 400). February 29 birthdays are recognized in leap years and handled appropriately in non-leap years.',
      },
      {
        question: 'Can I calculate age in months or weeks?',
        answer:
          'Yes, the total days shown can be converted: divide by 7 for weeks, or by 30.44 for approximate months. For infants and toddlers, pediatricians often calculate age in months up to 24 months. This calculator shows years, months, and remaining days for precise calculation.',
      },
      {
        question: 'What is chronological age vs biological age?',
        answer:
          'Chronological age is the calendar age calculated from your birth date — what this calculator shows. Biological age reflects how your body has aged physically and may differ from chronological age based on lifestyle, genetics, and health. Various medical tests estimate biological age.',
      },
    ],
  },

  'percentage-calculator': {
    h1: 'Percentage Calculator — Calculate Percentages Instantly',
    intro:
      'The Percentage Calculator solves the most common percentage problems with three calculation modes: find X% of a number, find what percentage one number is of another, and calculate the percentage increase or decrease between two values. No more mental math — get instant, accurate results.',
    sections: [
      {
        heading: 'Three Types of Percentage Calculations',
        content:
          'Mode 1 — "What is X% of Y?": Use for calculating discounts, tips, tax amounts, and interest. Formula: Result = (X/100) × Y. Example: What is 15% of ₹850? Answer: ₹127.50. Mode 2 — "X is what % of Y?": Use for finding what fraction one number is of another. Formula: % = (X/Y) × 100. Example: 45 out of 60 marks is 75%. Mode 3 — Percentage Change: Use for tracking price changes, growth rates, and comparisons. Formula: % Change = ((New – Old)/|Old|) × 100.',
      },
      {
        heading: 'Percentage in Everyday Finance',
        content:
          'Percentages are fundamental to personal finance. Interest rates on loans and FDs are expressed as percentages. Inflation erodes purchasing power at a rate of 5–6% annually in India. A mutual fund delivering 15% CAGR doubles your money every 4.8 years (Rule of 72: 72 ÷ rate = years to double). Tax slabs are percentage-based. Understanding percentages helps you evaluate investment returns, loan costs, and price changes objectively.',
      },
      {
        heading: 'Percentage Increase vs Absolute Increase',
        content:
          'A stock price rising from ₹100 to ₹110 is a 10% increase. But if it rises from ₹1,000 to ₹1,010, that\'s only a 1% increase despite the same ₹10 absolute gain. Similarly, a 50% decline requires a 100% gain to recover. This asymmetry is crucial in investing: losing 50% requires doubling your money just to break even. Always think in both absolute and percentage terms.',
      },
      {
        heading: 'Common Percentage Shortcuts',
        content:
          'Quick mental math: 10% of any number — move decimal one place left. 5% = half of 10%. 1% = move decimal two places left. 20% = double of 10%. 25% = divide by 4. 33.33% ≈ divide by 3. 50% = divide by 2. 75% = three-quarters. These shortcuts speed up mental calculations during negotiations, shopping, and quick financial estimates.',
      },
    ],
    faqs: [
      {
        question: 'What is the formula for percentage change?',
        answer:
          'Percentage Change = ((New Value – Old Value) / |Old Value|) × 100. A positive result means an increase; negative means a decrease. For example: price went from ₹200 to ₹250. Change = (250–200)/200 × 100 = 25% increase.',
      },
      {
        question: 'How do I calculate percentage marks?',
        answer:
          'Percentage = (Marks Obtained / Total Marks) × 100. For 432 out of 500 marks: 432/500 × 100 = 86.4%. For CGPA to percentage (most Indian universities): Multiply CGPA by 9.5 (CBSE standard).',
      },
      {
        question: 'How to add percentage to a price?',
        answer:
          'To add 18% to ₹1,000: Final = 1,000 × (1 + 18/100) = 1,000 × 1.18 = ₹1,180. Alternatively: 18% of ₹1,000 = ₹180; ₹1,000 + ₹180 = ₹1,180.',
      },
      {
        question: 'What percentage is 30 out of 40?',
        answer:
          '(30/40) × 100 = 75%. Use Mode 2 of this calculator: enter 30 as the value and 40 as the total to get 75%.',
      },
      {
        question: 'How is percentage error calculated?',
        answer:
          'Percentage Error = |Experimental – Theoretical| / |Theoretical| × 100. Used in science to express the accuracy of a measurement. For example, if theoretical boiling point is 100°C and you measured 98°C, the error is |98–100|/100 × 100 = 2%.',
      },
    ],
  },

  'bmi-calculator': {
    h1: 'BMI Calculator — Calculate Your Body Mass Index Online',
    intro:
      'The BMI (Body Mass Index) Calculator measures your body weight relative to your height to classify whether you are underweight, normal weight, overweight, or obese. While BMI is not a perfect health measure, it is widely used by doctors, dieticians, and health insurance companies as a quick screening tool.',
    sections: [
      {
        heading: 'What Is BMI and How Is It Calculated?',
        content:
          'BMI is calculated using the formula: BMI = Weight (kg) ÷ Height² (m²). For example, if you weigh 70 kg and are 175 cm tall: BMI = 70 ÷ (1.75)² = 70 ÷ 3.0625 = 22.9. This falls in the "Normal weight" range. WHO classifies BMI as: Below 18.5 = Underweight, 18.5–24.9 = Normal weight, 25.0–29.9 = Overweight, 30.0 and above = Obese. Some Asian health guidelines use slightly stricter cutoffs (23 for overweight, 27.5 for obese) as Asians tend to carry more visceral fat at lower BMIs.',
      },
      {
        heading: 'Limitations of BMI',
        content:
          'BMI is a screening tool, not a diagnostic measure. It has important limitations: it doesn\'t distinguish between muscle mass and fat mass (athletes may have high BMI but low body fat), doesn\'t account for fat distribution (visceral vs subcutaneous), doesn\'t consider age-related muscle loss in elderly, and doesn\'t reflect hormonal or metabolic health. Two people with the same BMI can have very different health profiles. Waist circumference, waist-to-hip ratio, and body fat percentage provide additional health insights.',
      },
      {
        heading: 'BMI for Different Age Groups',
        content:
          'For children and teenagers (2–19 years), BMI is plotted on age and sex-specific growth charts as BMI-for-age percentiles, since body composition changes during growth. For adults 20+, the standard BMI cutoffs apply. For older adults (65+), slightly higher BMI (25–27) may be protective against bone loss and early death. Pregnancy significantly affects weight and BMI should not be used during pregnancy.',
      },
      {
        heading: 'Healthy Ways to Reach Ideal BMI',
        content:
          'If your BMI is outside the normal range, gradual and sustainable changes are most effective. For weight loss: aim for 0.5–1 kg per week through a combination of moderate caloric deficit (300–500 kcal/day) and exercise. Crash diets are counterproductive. For underweight: focus on nutrient-dense calorie-rich foods and strength training. Always consult a registered dietician or doctor before starting any weight management program.',
      },
    ],
    faqs: [
      {
        question: 'What is a healthy BMI for Indians?',
        answer:
          'The WHO standard for normal BMI is 18.5–24.9. However, guidelines by the Indian Council of Medical Research (ICMR) and WHO for Asian populations suggest a lower threshold: 18.5–22.9 as normal, 23–24.9 as overweight, and 25+ as obese, due to higher metabolic risk at lower BMI values in Asian populations.',
      },
      {
        question: 'Can BMI be misleading for muscular people?',
        answer:
          'Yes. Muscle is denser than fat. Athletes and bodybuilders often have BMI in the overweight or obese range despite having low body fat. For such individuals, body fat percentage (measured by DEXA scan, bioimpedance, or calipers) is a more accurate health indicator.',
      },
      {
        question: 'What BMI is considered dangerously low?',
        answer:
          'BMI below 17.5 is associated with severe malnutrition and health risks including anemia, osteoporosis, heart problems, and compromised immunity. BMI below 15 is extremely dangerous and requires immediate medical intervention. Eating disorders like anorexia nervosa are associated with very low BMI.',
      },
      {
        question: 'How often should I calculate my BMI?',
        answer:
          'For most adults, checking BMI every 3–6 months is sufficient when tracking a weight management program. Daily fluctuations in weight (1–2 kg) are normal due to water retention, food, and exercise. Use weekly averages for more accurate tracking.',
      },
      {
        question: 'Is BMI used for life insurance premiums in India?',
        answer:
          'Yes. Many life and health insurance companies in India use BMI as one factor in determining premium rates. High BMI (obese range) can result in higher premiums or exclusions. Some insurers offer wellness programs that reward maintaining healthy BMI with premium discounts.',
      },
    ],
  },

  'word-counter': {
    h1: 'Word Counter — Count Words, Characters & More Online',
    intro:
      'The free online Word Counter tool instantly counts words, characters, sentences, paragraphs, and estimates reading time for any text. Perfect for writers, students, bloggers, and content marketers who need to meet word count requirements or optimize their content length.',
    sections: [
      {
        heading: 'What This Word Counter Measures',
        content:
          'This tool provides six key text metrics: (1) Word Count — total words separated by spaces, (2) Character Count — total characters including spaces, (3) Characters without spaces — pure text length, (4) Sentence Count — sentences ending with .!?, (5) Paragraph Count — text blocks separated by blank lines, (6) Reading Time — estimated at 200 words per minute (average adult reading speed). These metrics are updated in real time as you type or paste text.',
      },
      {
        heading: 'Why Word Count Matters for Content',
        content:
          'SEO research consistently shows that long-form content (1,500–3,000 words) tends to rank better in Google search results, as it comprehensively covers a topic. However, quality matters more than quantity. Academic assignments typically require 500–5,000 words depending on level. Tweets are limited to 280 characters. LinkedIn posts perform best at 150–300 words. Blog posts: 1,000–2,000 words. Landing pages: 300–500 words. Email subject lines: 6–10 words for best open rates.',
      },
      {
        heading: 'Reading Time Calculation',
        content:
          'This tool estimates reading time at 200 words per minute (WPM), which is a conservative average for online reading. Actual reading speed varies: slow readers average 100–150 WPM, average readers 200–300 WPM, fast readers 300–400 WPM, and speed readers 400+ WPM. For spoken content (podcasts, speeches), average speaking speed is 130–150 WPM. A 1,000-word article takes about 5 minutes to read at average speed.',
      },
      {
        heading: 'Word Count for Social Media Platforms',
        content:
          'Different platforms have different optimal and maximum word/character limits: Twitter/X: 280 characters; Facebook posts: 63,206 chars (optimal 40–80 words); Instagram captions: 2,200 chars (optimal 138–150); LinkedIn: 3,000 chars for posts (optimal 150–300); YouTube descriptions: 5,000 chars; WhatsApp status: 700 chars; Pinterest descriptions: 500 chars. Use this counter to optimize your content for each platform before publishing.',
      },
    ],
    faqs: [
      {
        question: 'Does this word counter work offline?',
        answer:
          'Yes. Once the page is loaded, the word counter works entirely in your browser without any server communication. Your text is never sent to any server — it\'s completely private and works without an internet connection.',
      },
      {
        question: 'How are words counted?',
        answer:
          'Words are counted by splitting text on whitespace (spaces, tabs, newlines). Hyphenated words like "well-known" count as one word. Numbers count as words. Punctuation attached to words (like "hello,") is counted as part of the word. Empty lines between paragraphs are not counted as words.',
      },
      {
        question: 'What is the ideal word count for a blog post?',
        answer:
          'For SEO, 1,500–2,500 words is the sweet spot for most topics. HubSpot data shows posts with 2,250–2,500 words get the most organic traffic. However, match length to user intent: how-to guides benefit from detail, while news articles are best kept concise at 300–600 words.',
      },
      {
        question: 'Can I count words in multiple languages?',
        answer:
          'Yes, for space-separated languages (Hindi, Marathi, Spanish, French, etc.), the counter works perfectly. For languages without spaces between words (Chinese, Japanese, Thai), word counting works differently — the character count is more meaningful.',
      },
      {
        question: 'What is the average word count of famous documents?',
        answer:
          'US Constitution: ~4,500 words. Indian Constitution: ~146,000 words (largest in the world). Gettysburg Address: 271 words. Average novel: 70,000–100,000 words. Academic PhD thesis: 80,000–100,000 words. Short story: 1,000–7,500 words.',
      },
    ],
  },

  'json-formatter': {
    h1: 'JSON Formatter — Format, Validate & Minify JSON Online',
    intro:
      'The free JSON Formatter tool instantly beautifies messy JSON data into a readable, indented format. It also validates JSON syntax, minifies JSON for production use, and lets you copy the output with one click. No installation needed — works entirely in your browser.',
    sections: [
      {
        heading: 'What is JSON and Why Format It?',
        content:
          'JSON (JavaScript Object Notation) is a lightweight data interchange format used in APIs, configuration files, and databases. Raw API responses are often minified (no spaces or newlines) to reduce bandwidth, making them nearly impossible to read. Formatting (prettifying) JSON adds consistent indentation and line breaks to reveal the data structure clearly. Well-formatted JSON makes debugging API responses, reading configuration files, and understanding nested data structures much faster.',
      },
      {
        heading: 'JSON Syntax Rules',
        content:
          'Valid JSON must follow strict rules: (1) Data is in key-value pairs separated by colons. (2) Key names must be double-quoted strings. (3) Values can be: string (double-quoted), number, boolean (true/false), null, array ([]), or object ({}). (4) Items in arrays and objects are separated by commas. (5) No trailing commas after the last item. (6) No comments in JSON (unlike JavaScript). (7) The entire document must be a single value (object, array, string, number, boolean, or null).',
      },
      {
        heading: 'Common JSON Errors and Fixes',
        content:
          'The most frequent JSON errors: (1) Single quotes instead of double quotes — always use double quotes for strings and keys. (2) Trailing commas — remove commas after the last item in objects/arrays. (3) Undefined values — JSON doesn\'t support undefined; use null instead. (4) NaN and Infinity — not valid JSON numbers; use null or a string representation. (5) Unescaped special characters — newlines, tabs, and quotes within strings must be escaped (\\n, \\t, \\"). (6) Missing quotes around keys — keys must always be quoted strings.',
      },
      {
        heading: 'JSON in APIs and Development',
        content:
          'REST APIs almost universally use JSON for request and response bodies. When you call an API like a weather service or payment gateway, the response is JSON. Developer tools (browser DevTools, Postman, Insomnia) have built-in JSON formatters. This standalone tool is useful when you need to quickly format a JSON snippet from logs, database records, or webhook payloads outside of a development environment. JSON is also used in package.json (Node.js), manifest.json (Chrome extensions), and appsettings.json (ASP.NET).',
      },
    ],
    faqs: [
      {
        question: 'Is my JSON data safe when using this tool?',
        answer:
          'Yes, completely. This JSON formatter runs entirely in your browser using JavaScript. Your JSON data is never sent to any server. This makes it safe to paste sensitive API responses, credentials, or private data for formatting.',
      },
      {
        question: 'What is the difference between JSON and JSON5?',
        answer:
          'JSON5 is a superset of JSON that allows comments, trailing commas, single-quoted strings, and unquoted keys. It\'s used in some config files (like VS Code settings.json). Standard JSON (RFC 8259) doesn\'t support these features. This formatter validates and formats standard JSON.',
      },
      {
        question: 'How to fix "Unexpected token" JSON error?',
        answer:
          'This error usually means: (1) single quotes used instead of double quotes, (2) a trailing comma after the last item, (3) an unquoted key, or (4) a JavaScript value like undefined or NaN instead of null. Paste your JSON here to identify the exact error location.',
      },
      {
        question: 'What is the maximum JSON file size this tool handles?',
        answer:
          'Since processing happens in your browser, the limit depends on your device\'s memory. For most modern computers, JSON files up to 10–50 MB process without issues. For very large files (100+ MB), a dedicated tool or command-line jq is recommended.',
      },
      {
        question: 'How to convert JSON to CSV?',
        answer:
          'This tool formats JSON but doesn\'t convert to CSV. For JSON to CSV conversion, you can use online tools, or in code: Python\'s pandas library (pd.read_json().to_csv()), JavaScript\'s json2csv library, or command-line jq with @csv output format.',
      },
    ],
  },

  'typing-speed-test': {
    h1: 'Typing Speed Test (WPM) — Online Test with Accuracy & Color Feedback',
    intro:
      'This typing speed test measures how fast and accurately you type. Words per minute (WPM) is estimated from correct characters, while accuracy and error counts help you see whether speed comes from skill or from mistakes. Each keystroke is compared to the passage: correct characters appear in green, wrong characters in red, and the rest of the line stays dim until you reach it. You can switch between short, medium, long, and code-style samples, or write your own text in the custom mode. The entire test runs in your browser, so you can practice without signing up and without sending your custom passages to a server.',
    sections: [
      {
        heading: 'How WPM, accuracy, and errors are calculated',
        content:
          'Net WPM is derived from the number of correct characters you typed per five-character “word” equivalent, divided by the elapsed time in minutes. Gross WPM is similar but uses total length typed, so it includes wrong keys. Accuracy is the percentage of keystrokes in your current attempt that match the target text. Errors is the number of keys that do not match the expected character. These metrics together give a more honest picture of typing than speed alone, which is what many employers and touch-typing schools emphasize.',
      },
      {
        heading: 'Why green and red feedback helps learning',
        content:
          'Visual feedback for correct and incorrect keys reduces the need to look at the keyboard and back repeatedly. You learn to associate finger motion with the next character, similar to how dedicated typing trainers work. The red highlight is only for the characters you have already submitted for that position, so you can backspace to fix a mistake and continue without resetting the whole passage. This keeps the flow of practice focused on accuracy as well as rhythm.',
      },
      {
        heading: 'Custom text and the code sample option',
        content:
          'If you are preparing for exams, interviews, or daily email work, you can paste or type your own passage (within the length limit) and use that as the test. The code sample mode uses a short snippet with symbols, parentheses, and line breaks, which is useful for developers who care about both typing natural language and non-alphanumeric keys. Pasting is disabled during the test so results stay comparable; use the custom text box in the “Custom” flow first, then type from memory or copy character by character if you are rehearsing a fixed script.',
      },
    ],
    faqs: [
      {
        question: 'What is a good typing speed in WPM?',
        answer:
          'Typical office targets are 40 WPM and above for professional typing. 60 WPM is often considered very productive; 80+ is excellent. Speed always needs to be read together with accuracy—high WPM with many errors is usually worse than moderate speed with few mistakes.',
      },
      {
        question: 'Is this typing test the same as Monkeytype or 10FastFingers?',
        answer:
          'The idea is similar: you type a passage and see WPM, but this tool is lightweight, runs fully on the page, and is tuned for our layout with color feedback, preset passages, and a custom text option. It is not a clone of any third-party product, but the metrics follow common WPM conventions (characters per “word” ÷ time).',
      },
      {
        question: 'Can I use this on mobile or tablet?',
        answer:
          'You can, but a physical keyboard is best for meaningful WPM scores. On-screen keyboards change timing and are less comparable to desktop results. The interface is responsive so you can still try short passages on a phone for fun or for accessibility practice.',
      },
      {
        question: 'Does the tool store or upload what I type?',
        answer:
          'Your typing stays in the browser for this test flow. We do not require an account, and the passage and your custom text are not sent to a server for scoring—results are calculated locally. For maximum privacy, avoid pasting highly sensitive data into the custom text field.',
      },
    ],
  },

  'fullscreen-stopwatch': {
    h1: 'Fullscreen Stopwatch — Large Display, True Black, Images & Browser Fullscreen',
    intro:
      'This stopwatch is built for a minimal on-screen experience: a very large, centered time readout with only the controls you need. You can make the page fill your screen with the browser’s fullscreen feature, choose a pure black background for zero visual noise, pick built-in color gradients, use sample high-resolution background photos, or upload your own image. Start, pause, and reset work from the bar at the bottom, and the space key starts or pauses the timer when you are not focused in a number field. All extended explanation lives on this page; the control surface stays intentionally free of long paragraphs so it works well in presentations, workouts, and focus sessions.',
    sections: [
      {
        heading: 'What you see in the app versus what is on this page',
        content:
          'The interactive area is designed to show mostly the running time, optional compact buttons (including Enter fullscreen and Exit fullscreen), and a collapsible options panel. Marketing copy, FAQ, and how-to text are in the sections below, which helps search engines and readers understand the tool while the live stopwatch can stay visually clean. That separation matches how many users want a “big clock” on the wall or on a second monitor without scrolling past essays.',
      },
      {
        heading: 'How backgrounds and true black work',
        content:
          'Pure black is a single option that fills the view with a solid #000000 background so the digits stand out with maximum contrast. The gradient presets are generated with CSS and load instantly. The sample photos load from a public image service and are suitable as demo backgrounds; you can replace them with your own file. Custom images are read in the browser and never have to be uploaded to our server— they stay on your device while you use the tool.',
      },
      {
        heading: 'Fullscreen support on different devices',
        content:
          'The Enter fullscreen and Exit fullscreen buttons use the standard Fullscreen API. Most desktop browsers support it for a container element. Some mobile operating systems only allow full-screen video or restrict API availability; if fullscreen is not supported, you can still use a large view by maximizing the window and using a dark background. After exiting browser fullscreen, the page returns to normal layout, including the article content below for reference.',
      },
    ],
    faqs: [
      {
        question: 'Does the stopwatch work offline?',
        answer:
          'The tool runs in your browser. If you have opened the page while online, the script may be cached, but a full offline experience is not guaranteed unless you have a PWA or cached assets. The timer itself does not require network calls to tick.',
      },
      {
        question: 'Is any image I upload sent to a server?',
        answer:
          'No. Custom background images are loaded with a local object URL in the browser. They are not transmitted to webeze for storage or analysis during normal use. Avoid uploading sensitive documents as images; treat it like any local-only preview.',
      },
      {
        question: 'What does the time format mean?',
        answer:
          'With hours below one hour, the stopwatch shows minutes, seconds, and centiseconds. After one hour, it switches to hours:minutes:seconds for legibility. Centiseconds are intended for light precision without mimicking a lab chronometer.',
      },
    ],
  },

  'fullscreen-countdown-timer': {
    h1: 'Fullscreen Countdown Timer — Set H/M/S, Minimal UI, Black or Custom Backgrounds',
    intro:
      'This countdown lets you set total time with hours, minutes, and seconds, then start a large, centered display that counts down to zero. Optional pure black, gradients, default sample photos, or a custom image mirror the same background system as the fullscreen stopwatch. When the countdown reaches zero, a short beep is played in browsers that support the Web Audio API. Fullscreen, start, pause, and reset are available from a compact control strip so the main view can stay as empty as you want; detailed guidance is in the body copy and FAQ on this page rather than in the tool chrome.',
    sections: [
      {
        heading: 'Countdown fields and resuming from pause',
        content:
          'While the timer is not running, changes to the hour, minute, and second fields update the displayed time and the amount that will be used on the next start. After you pause, the remaining time is preserved; those fields are not force-synced to the live remainder so the numbers in the form may still show your original target until you adjust them or use Reset, which realigns the display with the form values. When the timer finishes at zero, you can set a new duration in the same fields and start again.',
      },
      {
        heading: 'Sound at zero and accessibility',
        content:
          'The completion tone is a brief oscillator beep. If your system or browser mutes auto-play, you may not hear it; the visual will still read 00:00. Screen reader users can rely on the live readout; consider pairing this tool with system accessibility settings if you need strong alerts.',
      },
      {
        heading: 'Search-friendly structure without cluttering the timer',
        content:
          'Because the visible timer UI intentionally has little prose, this page adds structured headings, paragraphs, and frequently asked questions so that search engines and new visitors can still discover what the tool does, how to use it safely, and how it relates to a presentation or focus workflow.',
      },
    ],
    faqs: [
      {
        question: 'How is this different from a Pomodoro timer?',
        answer:
          'Pomodoro is usually fixed blocks such as 25 and 5 minutes. This tool counts down any h/m/s you set, with a presentation-oriented fullscreen look and the same background options as the stopwatch, rather than a prescribed productivity cadence.',
      },
      {
        question: 'Can I use this for a conference talk?',
        answer:
          'Yes. Use Enter fullscreen, pick a high-contrast background, and show only the time. Rehearse once on the actual hardware: projector resolution and browser chrome may differ, and some venues restrict browser fullscreen for security policy reasons.',
      },
      {
        question: 'Is my time data stored in the cloud?',
        answer:
          'No. The duration and running state are kept in the page during your session. There is no sign-in and no account storage of your countdowns as part of this feature.',
      },
    ],
  },
};

export function getSEOContent(tool: ToolConfig): ToolSEOContent {
  const existing = seoContent[tool.slug];
  if (existing) return existing;

  return {
    h1: `${tool.name} - Free Online Tool`,
    intro: `${tool.description} Use this fast and accurate ${tool.name.toLowerCase()} to get instant results in your browser without sign-up.`,
    sections: [
      {
        heading: `How to use the ${tool.name}`,
        content: `Enter your values in the input fields and the ${tool.name.toLowerCase()} will calculate results instantly. You can update inputs any time to compare scenarios quickly.`,
      },
      {
        heading: `Why use this ${tool.name.toLowerCase()} online`,
        content: `This tool is optimized for speed, mobile usage, and SEO-friendly structure. It is free to use and runs directly in your browser for a better user experience.`,
      },
      {
        heading: `${tool.name} for accurate calculations and conversions`,
        content: `This page is built to provide clear inputs, readable outputs, and practical real-world usage. Save time by using this reliable ${tool.name.toLowerCase()} whenever needed.`,
      },
    ],
    faqs: [
      {
        question: `Is this ${tool.name.toLowerCase()} free to use?`,
        answer: `Yes, this ${tool.name.toLowerCase()} is completely free and available without registration.`,
      },
      {
        question: `Can I use this ${tool.name.toLowerCase()} on mobile?`,
        answer: `Yes, the tool is fully responsive and works on desktop, tablet, and mobile devices.`,
      },
      {
        question: `Are results instant in this ${tool.name.toLowerCase()}?`,
        answer: `Yes, results are generated instantly as soon as you provide valid inputs.`,
      },
      {
        question: `Is my data safe while using this tool?`,
        answer: `For most tools, processing happens in your browser. We do not require sign-up to use the calculators and utilities.`,
      },
    ],
  };
}

export default seoContent;
