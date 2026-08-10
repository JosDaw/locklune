import { Ionicons } from '@expo/vector-icons';
import { CYCLE_MODE, pregnancyProgress, todayEpochDay, type Cycle } from '@locklune/core';
import { useMemo } from 'react';
import { Alert, View } from 'react-native';
import { CycleRow } from '../../components/CycleRow';
import { StatTile } from '../../components/StatTile';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { Txt } from '../../components/ui/Text';
import { t, useLocale } from '../../i18n';
import { confidenceLabel, formatDay, relativeDays } from '../../lib/format';
import * as haptics from '../../lib/haptics';
import { useDataStore } from '../../stores/dataStore';
import { colors } from '../../theme/colors';

export default function Insights() {
  useLocale();
  const cycles = useDataStore((store) => store.cycles);
  const prediction = useDataStore((store) => store.prediction);
  const settings = useDataStore((store) => store.settings);
  const deleteCycle = useDataStore((store) => store.deleteCycle);
  const today = todayEpochDay();

  const confirmDelete = (cycle: Cycle) => {
    haptics.warn();
    Alert.alert(
      t('insights.deletePeriodTitle'),
      t('insights.deletePeriodBody', { date: formatDay(cycle.startDay) }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => void (async () => (await deleteCycle(cycle.id)) && haptics.success())(),
        },
      ],
    );
  };
  const preg =
    settings.cycleMode === CYCLE_MODE.Pregnant && settings.pregnancyDueDay != null
      ? pregnancyProgress(settings.pregnancyDueDay, today)
      : null;

  const lengths = useMemo(() => {
    const result: number[] = [];
    for (let index = 1; index < cycles.length; index++)
      result.push(cycles[index]!.startDay - cycles[index - 1]!.startDay);
    return result.slice(-8);
  }, [cycles]);

  const maxLen = Math.max(35, ...lengths);

  return (
    <Screen>
      <View className="flex-row items-center gap-2 pb-1 pt-2">
        <Ionicons name="stats-chart" size={14} color={colors.primarySoft} />
        <Txt variant="faint">{t('insights.headerSubtitle')}</Txt>
      </View>

      {/* Illuminated stat tiles */}
      <Card>
        <View className="flex-row gap-3">
          <StatTile
            label={t('insights.avgCycle')}
            value={t('insights.days', { count: Math.round(prediction.averageCycleLength) })}
          />
          <StatTile
            label={t('insights.avgPeriod')}
            value={t('insights.days', { count: Math.round(prediction.averagePeriodLength) })}
          />
          <StatTile
            label={t('insights.variation')}
            value={t('insights.variability', { count: Math.round(prediction.variability) })}
          />
        </View>
        <Txt variant="faint" className="mt-4 text-center">
          {confidenceLabel(prediction.confidence)} ·{' '}
          {t('insights.analyzed', { count: prediction.cyclesAnalyzed })}
        </Txt>
      </Card>

      {/* Cycle length bar chart */}
      <Card>
        <Txt variant="title" className="mb-4">
          {t('insights.recentLengths')}
        </Txt>
        {lengths.length === 0 ? (
          <View className="items-center gap-3 py-4">
            <Ionicons name="analytics-outline" size={32} color={colors.textFaint} />
            <Txt variant="muted" className="text-center">
              {t('insights.logTwoPeriods')}
            </Txt>
          </View>
        ) : (
          <View className="gap-3">
            {lengths.map((length, index) => (
              <View key={index} className="flex-row items-center gap-3">
                <Txt variant="faint" className="w-5 text-right text-2xs">
                  {index + 1}
                </Txt>
                <View className="h-4 flex-1 overflow-hidden rounded-full bg-surfaceMuted">
                  <View
                    className="h-4 rounded-full bg-period"
                    style={{
                      width: `${Math.min(100, (length / maxLen) * 100)}%`,
                      opacity: 0.7 + 0.3 * (index / Math.max(1, lengths.length - 1)),
                    }}
                  />
                </View>
                <Txt variant="muted" className="w-12 text-right">
                  {t('insights.days', { count: length })}
                </Txt>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Upcoming or pregnancy */}
      {settings.cycleMode === CYCLE_MODE.Pregnant ? (
        <Card>
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="heart-outline" size={14} color={colors.textFaint} />
            <Txt variant="title">{t('insights.pregnancy')}</Txt>
          </View>
          {preg ? (
            <View className="gap-2">
              <Txt variant="display">
                {preg.dayOfWeek > 0
                  ? t('insights.weekPlusDay', { week: preg.week, days: preg.dayOfWeek })
                  : t('insights.weekOnly', { week: preg.week })}
              </Txt>
              <Txt variant="muted">
                {t('insights.trimesterLine', {
                  trimester: preg.trimester,
                  remaining:
                    preg.daysRemaining >= 0
                      ? t('insights.daysToGo', { count: preg.daysRemaining })
                      : t('insights.daysOver', { count: -preg.daysRemaining }),
                })}
              </Txt>
              <Txt variant="faint">
                {t('insights.estimatedDue', {
                  date: formatDay(preg.dueDay, { month: 'long', day: 'numeric' }),
                })}
              </Txt>
            </View>
          ) : (
            <Txt variant="muted">{t('insights.setWeeks')}</Txt>
          )}
        </Card>
      ) : (
        <Card>
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="calendar-outline" size={14} color={colors.textFaint} />
            <Txt variant="title">
              {settings.cycleMode === CYCLE_MODE.Contraception
                ? t('insights.upcomingBleeds')
                : t('insights.upcomingPeriods')}
            </Txt>
          </View>
          {prediction.upcoming.length === 0 ? (
            <View className="items-center gap-3 py-2">
              <Txt variant="muted" className="text-center">
                {t('insights.logFirstPeriod')}
              </Txt>
            </View>
          ) : (
            <View className="gap-3">
              {prediction.upcoming
                .filter((upcoming) => upcoming.periodStart <= today + 183)
                .map((upcoming, index) => (
                  <View
                    key={index}
                    className="flex-row items-center justify-between py-1"
                    style={
                      index > 0 ? { borderTopWidth: 1, borderTopColor: colors.border } : undefined
                    }
                  >
                    <Txt variant="body">
                      {formatDay(upcoming.periodStart, { month: 'long', day: 'numeric' })}
                    </Txt>
                    <Txt variant="faint">{relativeDays(upcoming.periodStart)}</Txt>
                  </View>
                ))}
            </View>
          )}
        </Card>
      )}

      {/* Cycle history */}
      {cycles.length > 0 && (
        <Card>
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="time-outline" size={14} color={colors.textFaint} />
            <Txt variant="title">{t('insights.cycleHistory')}</Txt>
          </View>
          <View className="gap-3">
            {[...cycles]
              .reverse()
              .slice(0, 12)
              .map((cycle) => (
                <CycleRow key={cycle.id} cycle={cycle} onDelete={() => confirmDelete(cycle)} />
              ))}
          </View>
        </Card>
      )}

      <Txt variant="faint" className="text-center">
        {t('insights.disclaimer')}
      </Txt>
    </Screen>
  );
}
