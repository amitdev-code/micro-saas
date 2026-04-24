export function calculateSIP(
  monthlyInvestment: number,
  annualRate: number,
  years: number
) {
  const monthlyRate = annualRate / 12 / 100;
  const months = years * 12;
  const futureValue =
    monthlyInvestment *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate);
  const totalInvestment = monthlyInvestment * months;
  const estimatedReturns = futureValue - totalInvestment;
  return {
    futureValue: Math.round(futureValue),
    totalInvestment: Math.round(totalInvestment),
    estimatedReturns: Math.round(estimatedReturns),
  };
}

export function calculateEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number
) {
  const monthlyRate = annualRate / 12 / 100;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - principal;
  return {
    emi: Math.round(emi),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
  };
}

export function calculateFD(
  principal: number,
  annualRate: number,
  years: number,
  compoundingFrequency: number
) {
  const maturityAmount =
    principal *
    Math.pow(
      1 + annualRate / (100 * compoundingFrequency),
      compoundingFrequency * years
    );
  const interestEarned = maturityAmount - principal;
  return {
    maturityAmount: Math.round(maturityAmount),
    interestEarned: Math.round(interestEarned),
  };
}

export function calculateGST(
  amount: number,
  gstRate: number,
  isInclusive: boolean
) {
  if (isInclusive) {
    const baseAmount = (amount * 100) / (100 + gstRate);
    const gstAmount = amount - baseAmount;
    return {
      baseAmount: Math.round(baseAmount * 100) / 100,
      gstAmount: Math.round(gstAmount * 100) / 100,
      totalAmount: amount,
    };
  }
  const gstAmount = (amount * gstRate) / 100;
  const totalAmount = amount + gstAmount;
  return {
    baseAmount: amount,
    gstAmount: Math.round(gstAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
}

export function calculateDiscount(
  originalPrice: number,
  discountPercent: number
) {
  const discountAmount = (originalPrice * discountPercent) / 100;
  const finalPrice = originalPrice - discountAmount;
  return {
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalPrice: Math.round(finalPrice * 100) / 100,
    savings: Math.round(discountAmount * 100) / 100,
  };
}

export function calculateAge(birthDate: Date) {
  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const totalDays = Math.floor(
    (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const nextBirthday = new Date(
    today.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate()
  );
  if (nextBirthday <= today) nextBirthday.setFullYear(today.getFullYear() + 1);
  const daysUntilBirthday = Math.ceil(
    (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return { years, months, days, totalDays, daysUntilBirthday };
}

export function calculatePercentageOf(percent: number, total: number) {
  return Math.round((percent / 100) * total * 100) / 100;
}

export function calculateWhatPercent(value: number, total: number) {
  return Math.round((value / total) * 10000) / 100;
}

export function calculatePercentageChange(oldValue: number, newValue: number) {
  const change = ((newValue - oldValue) / Math.abs(oldValue)) * 100;
  return Math.round(change * 100) / 100;
}

export function calculateBMI(weightKg: number, heightCm: number) {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const rounded = Math.round(bmi * 10) / 10;

  let category: string;
  let colorClass: string;
  if (bmi < 18.5) {
    category = 'Underweight';
    colorClass = 'text-blue-600 dark:text-blue-400';
  } else if (bmi < 25) {
    category = 'Normal weight';
    colorClass = 'text-green-600 dark:text-green-400';
  } else if (bmi < 30) {
    category = 'Overweight';
    colorClass = 'text-yellow-600 dark:text-yellow-400';
  } else {
    category = 'Obese';
    colorClass = 'text-red-600 dark:text-red-400';
  }
  return { bmi: rounded, category, colorClass };
}

export function analyzeText(text: string) {
  const trimmed = text.trim();
  const words = trimmed === '' ? 0 : trimmed.split(/\s+/).length;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const sentences =
    trimmed === ''
      ? 0
      : text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const paragraphs =
    trimmed === ''
      ? 0
      : text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length || (trimmed ? 1 : 0);
  const readingTime = Math.max(1, Math.ceil(words / 200));
  return { words, characters, charactersNoSpaces, sentences, paragraphs, readingTime };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value);
}
