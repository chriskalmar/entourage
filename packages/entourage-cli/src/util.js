const printDotsInterval = 2000;

export const printProgressDots = () => {
  process.stdout.write('.');

  const interval = setInterval(() => {
    process.stdout.write('.');
  }, printDotsInterval);

  return () => {
    clearInterval(interval);
    console.log();
  };
};

export const sleep = async ms =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });
