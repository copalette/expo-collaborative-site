import fs from 'fs';
import path from 'path';

interface Contribution {
  timestamp: string;
  contributor: string;
  type: string;
  summary: string;
  description: string;
  files: string[];
  commit: string | null;
}

export class ContributionLogger {
  private static contributionsPath = path.join(process.cwd(), 'src/data/contributions.json');

  static async log(contribution: Omit<Contribution, 'timestamp'>) {
    try {
      const data = await this.read();
      const newContribution: Contribution = {
        ...contribution,
        timestamp: new Date().toISOString(),
      };
      
      data.contributions.unshift(newContribution);
      data.metadata.totalContributions++;
      
      await this.write(data);
      console.log(`✅ 貢献が記録されました: ${contribution.summary}`);
      
      return newContribution;
    } catch (error) {
      console.error('❌ 貢献の記録に失敗しました:', error);
      throw error;
    }
  }

  private static async read() {
    try {
      const content = fs.readFileSync(this.contributionsPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      // ファイルが存在しない場合は初期化
      return {
        contributions: [],
        metadata: {
          project: "Expo 2025 Collaborative Site",
          startDate: new Date().toISOString().split('T')[0],
          totalContributions: 0,
          aiTools: ["Claude Code", "Codex"],
          humanContributors: []
        }
      };
    }
  }

  private static async write(data: any) {
    fs.writeFileSync(
      this.contributionsPath,
      JSON.stringify(data, null, 2),
      'utf-8'
    );
  }

  static async getLatest(count: number = 5) {
    const data = await this.read();
    return data.contributions.slice(0, count);
  }
}

// 使用例
export async function logContribution(
  contributor: string,
  type: string,
  summary: string,
  description: string,
  files: string[]
) {
  return ContributionLogger.log({
    contributor,
    type,
    summary,
    description,
    files,
    commit: null,
  });
}