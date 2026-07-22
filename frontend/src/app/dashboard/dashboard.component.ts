import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  effect,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EChartsOption } from 'echarts';
import * as echarts from 'echarts/core';
import { LineChart, BarChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import {
  NgxEchartsDirective,
  provideEchartsCore
} from 'ngx-echarts';
import { Subscription } from 'rxjs';

import {
  DashboardAnalytics,
  DashboardService,
  DashboardStats,
  TopMedication
} from '../core/services/dashboard.service';
import { DarkModeService } from '../core/services/dark-mode.service';
import { ToastService } from '../core/services/toast.service';

echarts.use([
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  CanvasRenderer
]);

type AnalyticsRange = 7 | 30 | 90;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);
  private readonly toastService = inject(ToastService);
  private readonly darkModeService = inject(DarkModeService);

  stats: DashboardStats | null = null;
  analytics: DashboardAnalytics | null = null;

  loading = true;
  analyticsLoading = true;
  error = '';
  analyticsError = '';

  selectedRange: AnalyticsRange = 30;

  salesTrendChartOptions: EChartsOption = {};
  topMedicationsChartOptions: EChartsOption = {};

  private readonly subscriptions = new Subscription();

  constructor() {
    effect(() => {
      this.darkModeService.theme();

      window.setTimeout(() => {
        if (this.analytics) {
          this.buildChartOptions(this.analytics);
        }
      }, 300);
    });
  }

  ngOnInit(): void {
    this.fetchStats();
    this.fetchAnalytics();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get analyticsScopeLabel(): string {
    if (!this.analytics?.scope) {
      return '';
    }

    if (this.analytics.scope === 'ALL_BRANCHES') {
      return 'All branches';
    }

    return this.analytics.branchName
      ? `Branch: ${this.analytics.branchName}`
      : 'My branch';
  }

  fetchStats(): void {
    this.loading = true;
    this.error = '';

    const statsSubscription = this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to load dashboard data.';
        this.showToast(this.error);
      }
    });

    this.subscriptions.add(statsSubscription);
  }

  changeRange(days: AnalyticsRange): void {
    if (this.selectedRange === days || this.analyticsLoading) {
      return;
    }

    this.selectedRange = days;
    this.fetchAnalytics();
  }

  get statCards(): Array<{
    label: string;
    value: number;
    icon: string;
    bg: string;
  }> {
    if (!this.stats) {
      return [];
    }

    return [
      {
        label: 'Branches',
        value: this.stats.totalBranches,
        icon: 'fas fa-building',
        bg: 'linear-gradient(135deg, #087f7b, #0b938c)'
      },
      {
        label: 'Users',
        value: this.stats.totalUsers,
        icon: 'fas fa-users',
        bg: 'linear-gradient(135deg, #1d7a46, #2daa63)'
      },
      {
        label: 'Total Sales',
        value: this.stats.totalSales,
        icon: 'fas fa-cart-shopping',
        bg: 'linear-gradient(135deg, #2563eb, #3b82f6)'
      },
      {
        label: 'Low Stock',
        value: this.stats.lowStockItems,
        icon: 'fas fa-triangle-exclamation',
        bg: 'linear-gradient(135deg, #b45309, #d97706)'
      },
      {
        label: 'Alerts',
        value: this.stats.activeAlerts,
        icon: 'fas fa-bell',
        bg: 'linear-gradient(135deg, #c2413b, #dc5b54)'
      }
    ];
  }

  private fetchAnalytics(): void {
    this.analyticsLoading = true;
    this.analyticsError = '';

    const analyticsSubscription = this.dashboardService
      .getAnalytics(this.selectedRange)
      .subscribe({
        next: (data) => {
          this.analytics = data;
          this.analyticsLoading = false;
          this.buildChartOptions(data);
        },
        error: () => {
          this.analyticsLoading = false;
          this.analyticsError = 'Failed to load visual analytics.';
          this.showToast(this.analyticsError);
        }
      });

    this.subscriptions.add(analyticsSubscription);
  }

  private buildChartOptions(analytics: DashboardAnalytics): void {
    const styles = getComputedStyle(document.documentElement);

    const textColor = this.readCssVariable(styles, '--color-text');
    const mutedTextColor = this.readCssVariable(styles, '--color-text-muted');
    const borderColor = this.readCssVariable(styles, '--color-border');
    const surfaceColor = this.readCssVariable(styles, '--color-surface');
    const primaryColor = this.readCssVariable(styles, '--color-primary-700');
    const primaryLightColor = this.readCssVariable(
      styles,
      '--color-primary-100'
    );
    const infoColor = this.readCssVariable(styles, '--color-info');

    const dates = analytics.salesTrend.map((point) =>
      this.formatDate(point.date)
    );
    const revenues = analytics.salesTrend.map((point) => point.revenue);
    const transactions = analytics.salesTrend.map(
      (point) => point.transactions
    );

    this.salesTrendChartOptions = {
      animationDuration: 450,
      animationEasing: 'cubicOut',
      color: [primaryColor, infoColor],
      grid: {
        top: 24,
        right: 20,
        bottom: 28,
        left: 12
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: surfaceColor,
        borderColor,
        borderWidth: 1,
        textStyle: {
          color: textColor
        },
        formatter: (params: unknown) => {
          const values = params as Array<{
            axisValue?: string;
            seriesName?: string;
            value?: number;
            marker?: string;
          }>;

          const date = values[0]?.axisValue ?? '';
          const revenue = values.find((item) => item.seriesName === 'Revenue');
          const transactionsValue = values.find(
            (item) => item.seriesName === 'Transactions'
          );

          return [
            `<strong>${date}</strong>`,
            `${revenue?.marker ?? ''} Revenue: ${this.formatCurrency(
              Number(revenue?.value ?? 0)
            )}`,
            `${transactionsValue?.marker ?? ''} Transactions: ${
              transactionsValue?.value ?? 0
            }`
          ].join('<br>');
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
        axisLine: {
          lineStyle: {
            color: borderColor
          }
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: mutedTextColor,
          fontSize: 11,
          hideOverlap: true
        }
      },
      yAxis: [
        {
          type: 'value',
          name: 'Revenue',
          nameTextStyle: {
            color: mutedTextColor,
            fontSize: 11
          },
          axisLabel: {
            color: mutedTextColor,
            fontSize: 11,
            formatter: (value: number) => `${value.toFixed(0)} TND`
          },
          splitLine: {
            lineStyle: {
              color: borderColor,
              type: 'dashed'
            }
          }
        },
        {
          type: 'value',
          name: 'Sales',
          nameTextStyle: {
            color: mutedTextColor,
            fontSize: 11
          },
          axisLabel: {
            color: mutedTextColor,
            fontSize: 11
          },
          splitLine: {
            show: false
          }
        }
      ],
      series: [
        {
          name: 'Revenue',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 7,
          data: revenues,
          lineStyle: {
            width: 3
          },
          areaStyle: {
            color: primaryLightColor,
            opacity: 0.7
          }
        },
        {
          name: 'Transactions',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          symbol: 'none',
          data: transactions,
          lineStyle: {
            width: 2,
            type: 'dashed'
          }
        }
      ]
    };

    this.topMedicationsChartOptions = this.buildTopMedicationsChart(
      analytics.topMedications,
      textColor,
      mutedTextColor,
      borderColor,
      surfaceColor,
      primaryColor
    );
  }

  private buildTopMedicationsChart(
    medications: TopMedication[],
    textColor: string,
    mutedTextColor: string,
    borderColor: string,
    surfaceColor: string,
    primaryColor: string
  ): EChartsOption {
    const sortedMedications = [...medications].reverse();

    return {
      animationDuration: 450,
      animationEasing: 'cubicOut',
      grid: {
        top: 10,
        right: 32,
        bottom: 8,
        left: 12
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: surfaceColor,
        borderColor,
        borderWidth: 1,
        textStyle: {
          color: textColor
        },
        formatter: (params: unknown) => {
          const values = params as Array<{
            dataIndex?: number;
            marker?: string;
          }>;

          const dataIndex = values[0]?.dataIndex ?? 0;
          const medication = sortedMedications[dataIndex];

          if (!medication) {
            return '';
          }

          return [
            `<strong>${medication.medicationName}</strong>`,
            `${values[0]?.marker ?? ''} Revenue: ${this.formatCurrency(
              medication.revenue
            )}`,
            `Quantity sold: ${medication.quantitySold}`
          ].join('<br>');
        }
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          color: mutedTextColor,
          fontSize: 11,
          formatter: (value: number) => `${value.toFixed(0)} TND`
        },
        splitLine: {
          lineStyle: {
            color: borderColor,
            type: 'dashed'
          }
        }
      },
      yAxis: {
        type: 'category',
        data: sortedMedications.map((item) =>
          this.truncateMedicationName(item.medicationName)
        ),
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: mutedTextColor,
          fontSize: 11
        }
      },
      series: [
        {
          name: 'Revenue',
          type: 'bar',
          barWidth: 18,
          data: sortedMedications.map((item) => item.revenue),
          itemStyle: {
            color: primaryColor,
            borderRadius: [0, 6, 6, 0]
          },
          emphasis: {
            itemStyle: {
              color: '#0b938c'
            }
          }
        }
      ]
    };
  }

  private showToast(message: string): void {
    const toast = this.toastService as unknown as {
      showError?: (value: string) => void;
      error?: (value: string) => void;
      show?: (value: string, type?: string) => void;
    };

    if (toast.showError) {
      toast.showError(message);
      return;
    }

    if (toast.error) {
      toast.error(message);
      return;
    }

    if (toast.show) {
      toast.show(message, 'error');
    }
  }

  private readCssVariable(
    styles: CSSStyleDeclaration,
    variable: string
  ): string {
    return styles.getPropertyValue(variable).trim();
  }

  private formatDate(date: string): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(new Date(`${date}T00:00:00`));
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  private truncateMedicationName(name: string): string {
    return name.length > 24 ? `${name.slice(0, 24)}...` : name;
  }
}