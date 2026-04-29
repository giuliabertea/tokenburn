import chalk from 'chalk';

export async function runDashboard(port: number): Promise<void> {
  const { createApp } = await import('../server/index.js');
  const { default: open } = await import('open');

  const app = createApp();
  const server = app.listen(port, () => {
    console.log(chalk.dim(`TokenBurn dashboard starting on port ${port}...`));
  });

  const url = `http://localhost:${port}`;
  let ready = false;
  const deadline = Date.now() + 2000;

  while (!ready && Date.now() < deadline) {
    try {
      await fetch(`${url}/api/kpis`);
      ready = true;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  if (!ready) {
    console.error(chalk.red('Server did not become ready in time.'));
    server.close();
    process.exit(1);
  }

  console.log(chalk.green(`✓ Dashboard running at ${url}`));
  await open(url);

  process.on('SIGINT', () => {
    server.close();
    process.exit(0);
  });
}
