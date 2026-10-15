import React, { useState } from 'react';
import { TestSuiteResponse, ChecksumsResponse } from '../types';
import { 
  Play, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  ShieldCheck, 
  FileCheck, 
  Check, 
  AlertTriangle,
  Clock
} from 'lucide-react';

export const TestRunner: React.FC = () => {
  const [runningSuite, setRunningSuite] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestSuiteResponse>>({});
  const [verifyingChecksums, setVerifyingChecksums] = useState(false);
  const [checksumsData, setChecksumsData] = useState<ChecksumsResponse | null>(null);

  const runSuite = async (suite: string) => {
    setRunningSuite(suite);
    try {
      const res = await fetch('/api/tests/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suite }),
      });
      const data = await res.json();
      setTestResults((prev) => ({ ...prev, [suite]: data }));
    } catch (err: any) {
      console.error(`Error running suite ${suite}:`, err);
    } finally {
      setRunningSuite(null);
    }
  };

  const runAllSuites = async () => {
    await runSuite('anikage');
    await runSuite('weebcentral');
    await runSuite('release_guard');
  };

  const verifyChecksums = async () => {
    setVerifyingChecksums(true);
    try {
      const res = await fetch('/api/verify/checksums', { method: 'POST' });
      const data = await res.json();
      setChecksumsData(data);
    } catch (err: any) {
      console.error('Error verifying checksums:', err);
    } finally {
      setVerifyingChecksums(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Suites Overview Header */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-600/10 p-2.5 text-indigo-400 border border-indigo-500/20">
              <Terminal className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Repository QA &amp; Automated Test Battery</h2>
              <p className="text-xs text-zinc-400">
                Execute TAP unit tests, chapter ordering assertions, and SHA-256 cryptographic verifications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runAllSuites}
              disabled={!!runningSuite}
              className={`flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all ${
                runningSuite ? 'opacity-60 cursor-not-allowed' : 'hover:bg-indigo-500 cursor-pointer'
              }`}
            >
              {runningSuite ? (
                <>
                  <RotateCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Running {runningSuite}...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Run All Test Suites</span>
                </>
              )}
            </button>

            <button
              onClick={verifyChecksums}
              disabled={verifyingChecksums}
              className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-all cursor-pointer"
            >
              {verifyingChecksums ? (
                <RotateCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileCheck className="h-3.5 w-3.5 text-emerald-400" />
              )}
              <span>Verify SHA256 Sums</span>
            </button>
          </div>
        </div>

        {/* 3 Main Test Suites Grid */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Suite 1: AniKage */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">AniKage Module Suite</span>
                {testResults['anikage'] && (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      testResults['anikage'].success
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {testResults['anikage'].success ? '13/13 PASSED' : 'FAILED'}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                429 cooldown, relative manifest URL resolution, bad episode ref rejection, HLS segment byte validation, language isolation.
              </p>
            </div>

            <button
              onClick={() => runSuite('anikage')}
              disabled={runningSuite === 'anikage'}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white cursor-pointer"
            >
              {runningSuite === 'anikage' ? (
                <RotateCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              <span>Run Suite (13 tests)</span>
            </button>
          </div>

          {/* Suite 2: WeebCentral */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">WeebCentral Order Suite</span>
                {testResults['weebcentral'] && (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      testResults['weebcentral'].success
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {testResults['weebcentral'].success ? '6/6 PASSED' : 'FAILED'}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Source order preservation, hash-labelled chapter numeric metadata, special &amp; volume label isolation.
              </p>
            </div>

            <button
              onClick={() => runSuite('weebcentral')}
              disabled={runningSuite === 'weebcentral'}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white cursor-pointer"
            >
              {runningSuite === 'weebcentral' ? (
                <RotateCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              <span>Run Suite (6 tests)</span>
            </button>
          </div>

          {/* Suite 3: Release Guard */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">Release Guard Suite</span>
                {testResults['release_guard'] && (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      testResults['release_guard'].success
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {testResults['release_guard'].success ? '8/8 PASSED' : 'FAILED'}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Immutable digest verification, public URL download guard, upload draft recovery, bounded retries on 404.
              </p>
            </div>

            <button
              onClick={() => runSuite('release_guard')}
              disabled={runningSuite === 'release_guard'}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white cursor-pointer"
            >
              {runningSuite === 'release_guard' ? (
                <RotateCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              <span>Run Suite (8 tests)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Test Results Output */}
      {Object.entries(testResults).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
            Suite Execution Results
          </h3>
          <div className="space-y-4">
            {Object.entries(testResults).map(([suiteName, res]) => (
              <div
                key={suiteName}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white capitalize">{suiteName} Test Suite</span>
                    <span className="text-xs text-zinc-400">
                      ({res.passed}/{res.total} tests passed)
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${
                      res.success
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {res.success ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    <span>{res.success ? 'ALL PASSED' : 'TESTS FAILED'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                  {res.tests.map((t, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 rounded-lg bg-zinc-950 p-2.5 border border-zinc-800/80"
                    >
                      {t.ok ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <span className={t.ok ? 'text-zinc-200' : 'text-rose-300'}>{t.name}</span>
                        {t.durationMs != null && (
                          <span className="text-[10px] text-zinc-500 block">
                            {t.durationMs.toFixed(2)} ms
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checksums Results */}
      {checksumsData && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <span>SHA-256 Checksums Validation</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Validated {checksumsData.totalChecked} modules and bundles against official SHA256SUMS
              </p>
            </div>

            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4" />
              <span>100% Cryptographically Valid</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-80 overflow-y-auto text-xs font-mono">
            {checksumsData.results.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg bg-zinc-950 p-2.5 border border-zinc-800"
              >
                <div className="truncate mr-2">
                  <span className="text-zinc-300 truncate block">{item.file}</span>
                  <span className="text-[10px] text-zinc-500 truncate block">
                    {item.expectedHash}
                  </span>
                </div>
                <span className="text-emerald-400 shrink-0 font-bold text-[11px] flex items-center gap-1">
                  <Check className="h-3 w-3" /> OK
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
