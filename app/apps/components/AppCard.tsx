"use client";

import { App } from "@/lib/models/app";
import { motion } from "framer-motion";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import {
  Copy,
  Download,
  Edit,
  Github,
  Play,
  QrCode,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import VideoModal from "./VideoModal";

interface AppCardProps {
  app: App;
  onEdit?: (app: App) => void; // eslint-disable-line no-unused-vars
  onDelete?: (app: App) => void; // eslint-disable-line no-unused-vars
}

// 日期格式化函数
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function AppCard({ app, onEdit, onDelete }: AppCardProps) {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [dauTrend, setDauTrend] = useState<number[]>([]);
  const [buttonWidth, setButtonWidth] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 获取DAU趋势数据
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/apps/${app.id}/stats?days=7`);
        if (response.ok) {
          const data = await response.json();
          const trendData = data.stats.map((stat: any) => stat.dau).reverse();

          // 如果数据不足7天，用0补齐
          const paddedData = [];
          for (let i = 0; i < 7; i++) {
            paddedData.push(trendData[i] || 0);
          }

          setDauTrend(paddedData);
        } else {
          // 如果请求失败，用0补齐7天数据
          setDauTrend(new Array(7).fill(0));
        }
      } catch (error) {
        // 如果出错，用0补齐7天数据
        setDauTrend(new Array(7).fill(0));
      }
    };

    fetchStats();
  }, [app.id, app.dau]);


  // 获取按钮宽度
  useEffect(() => {
    const updateButtonWidth = () => {
      if (buttonRef.current) {
        setButtonWidth(buttonRef.current.offsetWidth);
      }
    };

    updateButtonWidth();
    window.addEventListener("resize", updateButtonWidth);

    return () => {
      window.removeEventListener("resize", updateButtonWidth);
    };
  }, []);


  // 处理复制GitHub地址
  const handleCopyGithubUrl = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (app.github_url) {
      try {
        await navigator.clipboard.writeText(app.github_url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        // 复制失败，静默处理
      }
    }
  };

  // DAU趋势图表配置
  const getDauChartOptions = () => {
    const dates: string[] = [];
    const fullDates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(
        date.toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" }),
      );
      fullDates.push(
        date
          .toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
          .replace(/\//g, "/"),
      );
    }

    // 计算Y轴范围
    const minValue = Math.min(...dauTrend);
    const maxValue = Math.max(...dauTrend);
    const range = maxValue - minValue;
    const padding = range > 0 ? range * 0.1 : 1; // 10% padding，如果全为0则给1的padding

    // 智能计算合适的刻度单位
    const rawRange = maxValue - minValue + padding * 2;
    const idealTickCount = 5; // 理想的刻度数量
    const rawTickSize = rawRange / idealTickCount;

    let tickSize = 1;
    let yMin = 0;
    let yMax = 1;
    let yAxisTicks: number[] = [0, 1];

    if (rawRange > 0) {
      // 计算合适的刻度单位（1, 2, 5, 10, 20, 50, 100, 200, 500, 1000等）
      const magnitude = Math.pow(10, Math.floor(Math.log10(rawTickSize)));
      const normalizedTickSize = rawTickSize / magnitude;

      if (normalizedTickSize <= 1) {
        tickSize = magnitude;
      } else if (normalizedTickSize <= 2) {
        tickSize = 2 * magnitude;
      } else if (normalizedTickSize <= 5) {
        tickSize = 5 * magnitude;
      } else {
        tickSize = 10 * magnitude;
      }

      // 计算Y轴范围
      yMin = Math.floor((minValue - padding) / tickSize) * tickSize;
      yMax = Math.ceil((maxValue + padding) / tickSize) * tickSize;

      // 生成Y轴刻度
      yAxisTicks = [];
      for (let i = yMin; i <= yMax; i += tickSize) {
        yAxisTicks.push(i);
      }
    }

    return {
      chart: {
        type: "line",
        height: 180,
        backgroundColor: "transparent",
        spacing: [5, 5, 5, 5],
        animation: {
          duration: 1000,
        },
      },
      title: {
        text: "",
      },
      xAxis: {
        categories: dates,
        labels: {
          style: {
            fontSize: "10px",
            color: "#6B7280",
          },
        },
        lineWidth: 0,
        tickLength: 0,
        gridLineWidth: 0,
      },
      yAxis: {
        title: {
          text: "",
        },
        min: yMin,
        max: yMax,
        tickPositions: yAxisTicks,
        labels: {
          enabled: true,
          style: {
            fontSize: "10px",
            color: "#6B7280",
          },
        },
        gridLineWidth: 1,
        gridLineColor: "#F3F4F6",
        lineWidth: 0,
        tickLength: 0,
        plotBands: yAxisTicks.slice(0, -1).map((tick, index) => ({
          from: tick,
          to: yAxisTicks[index + 1],
          color: index % 2 === 0 ? "#f1f8fc" : "transparent",
        })),
      },
      series: [
        {
          name: "DAU",
          data: dauTrend,
          color: "#006aff",
          lineWidth: 2,
          marker: {
            radius: 3,
            fillColor: "#006aff",
            lineWidth: 0,
          },
          animation: {
            duration: 1000,
            easing: "easeOutBounce",
          },
        },
      ],
      legend: {
        enabled: false,
      },
      credits: {
        enabled: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#ffffff",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        borderRadius: 8,
        shadow: {
          color: "rgba(0, 0, 0, 0.1)",
          offsetX: 0,
          offsetY: 2,
          opacity: 0.1,
          width: 3,
        },
        style: {
          color: "#374151",
          fontSize: "12px",
        },
        formatter: function (this: any): string { // eslint-disable-line no-unused-vars
          const pointIndex = this.point.index;
          const fullDate = fullDates[pointIndex];
          return `<div style="padding: 8px;">
            <div style="font-weight: 600; margin-bottom: 4px; color: #111827;">${fullDate}</div>
            <div style="color: #6b7280;">DAU: <span style="color: #006aff; font-weight: 600;">${this.y.toLocaleString()}</span></div>
          </div>`;
        },
      },
      plotOptions: {
        line: {
          animation: {
            duration: 1000,
          },
        },
      },
    };
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "app":
        return "应用";
      case "miniprogram":
        return "小程序";
      case "game":
        return "游戏";
      case "plugin":
        return "插件";
      default:
        return "应用";
    }
  };

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case "web":
        return "Web";
      case "mobile":
        return "移动端";
      case "wechat":
        return "微信";
      default:
        return "Web";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "beta":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "development":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "online":
        return "已上线";
      case "beta":
        return "测试版";
      case "development":
        return "开发中";
      default:
        return "未知";
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) {
      return "0";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <>
      <div className="py-4">
        <div className="flex h-72">
          {/* 左侧封面图片 - 3:4比例 */}
          <div className="w-48 h-full flex-shrink-0 rounded overflow-hidden relative group/cover">
            <Image
              src={
                app.cover_image_url
                  ? `/api/apps/proxy-image?url=${encodeURIComponent(app.cover_image_url)}`
                  : "/images/placeholder-app.png"
              }
              alt={app.name}
              width={192}
              height={256}
              className="w-full h-full object-cover transition-transform duration-300 group-hover/cover:scale-105"
            />

            {/* 播放按钮覆盖层 */}
            <div
              className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center cursor-pointer hover:bg-opacity-40 transition-all duration-300 opacity-0 group-hover/cover:opacity-100"
              onClick={() => setShowVideoModal(true)}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-white bg-opacity-90 rounded-full p-3"
              >
                <Play
                  className="w-6 h-6 text-gray-800 ml-0.5"
                  fill="currentColor"
                />
              </motion.div>
            </div>

            {/* 状态标签 */}
            <div className="absolute top-2 left-2">
              <span
                className={`px-2 py-1 text-xs font-blog rounded-full text-center flex items-center justify-center ${getStatusColor(app.status)}`}
              >
                {getStatusLabel(app.status)}
              </span>
            </div>
          </div>

          {/* 右侧内容 */}
          <div className="flex-1 pl-6 flex flex-col">
            {/* 标题和操作按钮 */}
            <div className="flex items-center gap-3 mb-2 group/title">
              <h2 className="text-xl font-bold text-text-primary font-heading group-hover:text-primary transition-colors line-clamp-2 flex-1">
                <Link href={`/apps/${app.id}`}>{app.name}</Link>
              </h2>
              
              {/* 编辑和删除按钮 */}
              <div className="flex items-center gap-2 opacity-0 group-hover/title:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit?.(app);
                  }}
                  className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="编辑应用"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete?.(app);
                  }}
                  className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="删除应用"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* 标签 */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-text-secondary text-xs font-blog">
                #{getTypeLabel(app.type)}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-text-secondary text-xs font-blog">
                #{getPlatformLabel(app.platform)}
              </span>
            </div>

            {/* 下方左右两个区域 */}
            <div className="flex gap-4 flex-grow">
              {/* 左侧区域：信息行和简介 */}
              <div className="flex-1 flex flex-col">
                {/* 信息栏：数据指标 */}
                <div className="flex items-center gap-2 text-[11px] text-text-muted h-5 mb-4">
                  <div className="flex items-center gap-1">
                    <span>{formatDate(app.updated_at)}</span>
                  </div>
                  <span className="mx-0.5 inline-flex items-center justify-center text-[11px] leading-none text-text-muted translate-y-[2px] select-none">
                    ·
                  </span>
                  <div className="flex items-center gap-1">
                    <span>DAU {formatNumber(app.dau)}</span>
                  </div>
                  <span className="mx-0.5 inline-flex items-center justify-center text-[11px] leading-none text-text-muted translate-y-[2px] select-none">
                    ·
                  </span>
                  <div className="flex items-center gap-1">
                    <Download size={14} className="translate-y-[-1px]" />
                    <span>{formatNumber(app.downloads)}</span>
                  </div>
                  {/* <span className="mx-0.5 inline-flex items-center justify-center text-[11px] leading-none text-text-muted translate-y-[2px] select-none">·</span> */}
                  {/* <div className="flex items-center gap-1">
                    <TrendingUp size={14} className="text-green-500 translate-y-[-1px]" />
                    <span className="text-green-600 dark:text-green-400">{app.trend}</span>
                  </div> */}
                </div>

                {/* 应用描述 */}
                <div className="text-text-secondary text-sm font-blog line-clamp-3 flex-grow">
                  {app.description}
                </div>

                {/* 体验入口 */}
                <div className="mt-3 flex gap-3">
                  {/* 体验一下按钮 */}
                  <div className="relative inline-block group/qr">
                    <button
                      ref={buttonRef}
                      className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-all duration-300 font-blog bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 px-3 py-2 rounded hover:scale-105"
                    >
                      <QrCode size={14} />
                      <span>体验一下</span>
                    </button>

                    {/* 二维码悬浮显示 */}
                    <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover/qr:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg p-2 flex items-center justify-center"
                        style={{
                          width: `${buttonWidth}px`,
                          height: `${buttonWidth}px`,
                        }}
                      >
                        <Image
                          src={
                            app.qr_code_url
                              ? `/api/apps/proxy-image?url=${encodeURIComponent(app.qr_code_url)}`
                              : "/images/placeholder-qr.png"
                          }
                          alt={`${app.name} 二维码`}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 代码仓库按钮 */}
                  {app.github_url && (
                    <div className="relative inline-block group/github">
                      <button
                        className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-all duration-300 font-blog bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/20 dark:hover:bg-gray-800/30 px-3 py-2 rounded hover:scale-105"
                      >
                        <Github size={14} />
                        <span>代码仓库</span>
                      </button>

                      {/* GitHub地址悬浮显示 */}
                      <div className="absolute bottom-full left-0 mb-1 opacity-0 group-hover/github:opacity-100 transition-opacity duration-200 z-50">
                        {/* 连接线 - 让鼠标可以平滑移动 */}
                        <div className="h-1 w-full"></div>
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg p-3 flex items-center gap-2 min-w-max">
                          <span className="text-sm text-text-primary font-blog">{app.github_url}</span>
                          <button
                            onClick={handleCopyGithubUrl}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            title="复制地址"
                          >
                            <Copy size={14} className={copySuccess ? "text-green-500" : "text-text-secondary"} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 右侧区域：DAU趋势图表 */}
              <div className="w-64 flex flex-col">
                <div className="text-xs text-text-muted mb-4 font-blog">
                  最近7天DAU趋势
                </div>
                <div className="flex-grow">
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={getDauChartOptions()}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 卡片分隔线 */}
      <div className="mb-4 border-b border-gray-200 dark:border-gray-700"></div>

      {/* 视频播放模态框 */}
      {showVideoModal && (
        <VideoModal
          videoUrl={app.video_url || ""}
          title={app.name}
          onClose={() => setShowVideoModal(false)}
        />
      )}
    </>
  );
}
