"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Loading } from "../shared";
import { formatPrice } from "./shared";

export function CrmReportsTab() {
  const pipeline = useQuery(api.crmReporting.getPipelineReport);
  const forecast = useQuery(api.crmReporting.getForecast);
  const team = useQuery(api.crmReporting.getTeamPerformance, { periodDays: 90 });
  const sources = useQuery(api.crmReporting.getSourceReport);
  const cycleTime = useQuery(api.crmReporting.getCycleTime, { periodDays: 90 });
  const scoring = useQuery(api.crmScoring.getScoringOverview);

  if (!pipeline || !forecast || !team || !sources || !cycleTime || !scoring) {
    return <Loading />;
  }

  return (
    <div className="space-y-8">
      {/* Pipeline overview */}
      <section>
        <SectionTitle>Pipeline overzicht</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <ReportCard label="Totale pipeline" value={formatPrice(pipeline.totalPipeline)} />
          <ReportCard label="Gewogen pipeline" value={formatPrice(pipeline.weightedPipeline)} accent />
          <ReportCard label="Gem. doorlooptijd" value={`${cycleTime.avgDays} dagen`} sub={`${cycleTime.count} deals`} />
        </div>

        {/* Stage breakdown */}
        <div className="border border-rule rounded-[2px] overflow-hidden">
          {pipeline.stages.map((stage) => (
            <div key={stage.name} className="flex items-center border-b border-rule last:border-b-0 px-4 py-3">
              <div className="flex items-center gap-2 w-[180px]">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                <span className="text-[13px] font-medium">{stage.name}</span>
              </div>
              <div className="flex-1">
                <div className="h-5 bg-warm rounded-[2px] overflow-hidden">
                  <div
                    className="h-full rounded-[2px] transition-all"
                    style={{
                      backgroundColor: stage.color,
                      width: `${pipeline.totalPipeline > 0 ? (stage.totalValue / pipeline.totalPipeline) * 100 : 0}%`,
                      minWidth: stage.count > 0 ? "4px" : "0",
                    }}
                  />
                </div>
              </div>
              <div className="text-right w-[120px]">
                <p className="text-[13px] font-medium">{formatPrice(stage.totalValue)}</p>
                <p className="text-[11px] text-ink/40">{stage.count} leads</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Revenue forecast */}
      <section>
        <SectionTitle>Omzet forecast</SectionTitle>
        <div className="grid grid-cols-3 gap-4">
          <ReportCard label="30 dagen" value={formatPrice(forecast.forecast30)} />
          <ReportCard label="60 dagen" value={formatPrice(forecast.forecast60)} />
          <ReportCard label="90 dagen" value={formatPrice(forecast.forecast90)} accent />
        </div>
      </section>

      {/* Team performance */}
      <section>
        <SectionTitle>Team prestaties (90 dagen)</SectionTitle>
        {team.length === 0 ? (
          <p className="text-[13px] text-ink/30">Nog geen afgesloten deals</p>
        ) : (
          <div className="border border-rule rounded-[2px]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-rule">
                  <th className="text-left px-4 py-2 text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40">Teamlid</th>
                  <th className="text-right px-4 py-2 text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40">Gewonnen</th>
                  <th className="text-right px-4 py-2 text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40">Verloren</th>
                  <th className="text-right px-4 py-2 text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40">Win rate</th>
                  <th className="text-right px-4 py-2 text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40">Omzet</th>
                </tr>
              </thead>
              <tbody>
                {team.map((member) => (
                  <tr key={member.assignee} className="border-b border-rule last:border-b-0">
                    <td className="px-4 py-2.5 text-[13px] font-medium">{member.assignee.split("@")[0]}</td>
                    <td className="px-4 py-2.5 text-[13px] text-right text-green-600">{member.won}</td>
                    <td className="px-4 py-2.5 text-[13px] text-right text-red-500">{member.lost}</td>
                    <td className="px-4 py-2.5 text-[13px] text-right font-medium">{member.winRate}%</td>
                    <td className="px-4 py-2.5 text-[13px] text-right font-medium">{formatPrice(member.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Lead source effectiveness */}
      <section>
        <SectionTitle>Lead bron effectiviteit</SectionTitle>
        {sources.length === 0 ? (
          <p className="text-[13px] text-ink/30">Nog geen data</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {sources.map((source) => (
              <div key={source.source} className="border border-rule rounded-[2px] p-4 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium">{source.source}</p>
                  <p className="text-[11px] text-ink/40">
                    {source.total} leads — {source.won} gewonnen ({source.conversionRate}%)
                  </p>
                </div>
                <span className="text-[14px] font-medium text-copper">{formatPrice(source.revenue)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Scoring overview */}
      <section>
        <SectionTitle>Scoring overzicht</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <ReportCard label="Totaal contacten" value={String(scoring.totalContacts)} />
          <ReportCard label="Hoge intent (50+)" value={String(scoring.highIntent)} accent />
          <ReportCard label="Medium intent (20-49)" value={String(scoring.mediumIntent)} />
          <ReportCard label="Hoge engagement (30+)" value={String(scoring.highEngagement)} />
        </div>

        {scoring.topByIntent.length > 0 && (
          <div>
            <p className="text-[11px] font-medium text-ink/40 mb-2">Top 10 — intent score</p>
            <div className="border border-rule rounded-[2px]">
              {scoring.topByIntent.map((c) => (
                <div key={c._id} className="flex items-center justify-between px-4 py-2 border-b border-rule last:border-b-0">
                  <div>
                    <span className="text-[13px] font-medium">{c.firstName} {c.lastName}</span>
                    <span className="text-[11px] text-ink/40 ml-2">{c.company ?? c.email}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-[2px] bg-green-50 text-green-700">I: {c.intentScore}</span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-[2px] bg-blue-50 text-blue-700">E: {c.engagementScore}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-4">
      {children}
    </h2>
  );
}

function ReportCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="border border-rule rounded-[2px] p-4">
      <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-ink/40 mb-1">{label}</p>
      <p className={`font-display text-[22px] font-black tracking-[-0.02em] ${accent ? "text-copper" : "text-ink"}`}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-ink/40 mt-0.5">{sub}</p>}
    </div>
  );
}
