import { useEffect, useRef, useCallback, useMemo } from 'react'
import { Chart, registerables } from 'chart.js'
import { STREAM_COLORS } from './StreamTabs'

Chart.register(...registerables)

const MAX_POINTS = 800

const formatLabel = (ts) => {
    const d = new Date(ts)
    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

const EnergyChart = ({ streamData, streamName }) => {
    const chartRef = useRef(null)
    const chartInstance = useRef(null)

    const slicedData = useMemo(() => {
        if (!streamData) return null
        const step = Math.max(1, Math.ceil(streamData.all_timestamps.length / MAX_POINTS))

        const sampledIndices = new Set()
        for (let i = 0; i < streamData.all_timestamps.length; i += step) {
            sampledIndices.add(i)
        }

        const anomalyTsSet = new Set(streamData.anomalies.map(a => a.timestamp))
        streamData.all_timestamps.forEach((ts, i) => {
            if (anomalyTsSet.has(ts)) sampledIndices.add(i)
        })

        const sortedIndices = Array.from(sampledIndices).sort((a, b) => a - b)

        return {
            timestamps: sortedIndices.map(i => streamData.all_timestamps[i]),
            values: sortedIndices.map(i => streamData.all_values[i]),
            rollingMeans: sortedIndices.map(i => streamData.all_rolling_means[i]),
            anomalyMap: new Map(streamData.anomalies.map(a => [a.timestamp, a])),
        }
    }, [streamData])

    const updateChart = useCallback(() => {
        if (!chartRef.current || !slicedData) return
        const { timestamps, values, rollingMeans, anomalyMap } = slicedData
        const color = STREAM_COLORS[streamName] || '#888888'
        const colorFaded = color + '45'

        const labels = timestamps.map(formatLabel)
        const anomalyValues = timestamps.map(ts =>
            anomalyMap.has(ts) ? anomalyMap.get(ts).value : null
        )

        const tooltipCallbacks = {
            title: items => {
                const ts = timestamps[items[0].dataIndex]
                return new Date(ts).toLocaleString('en-US', {
                    month: 'short', day: 'numeric',
                    year: 'numeric', hour: '2-digit', minute: '2-digit',
                })
            },
            label: () => null,
            afterBody: items => {
                const ts = timestamps[items[0].dataIndex]
                const a = anomalyMap.get(ts)
                if (!a) return []
                return [
                    `Energy:     ${a.value}`,
                    `Mean:       ${a.rolling_mean}`,
                    `Std Dev:    ${a.rolling_std}`,
                    `Deviation:  ${a.deviation > 0 ? '+' : ''}${a.deviation}`,
                    `Votes:      ${a.votes}/3`,
                    ``,
                    a.explanation,
                ]
            },
        }

        if (!chartInstance.current) {
            chartInstance.current = new Chart(chartRef.current, {
                type: 'line',
                data: {
                    labels,
                    datasets: [
                        {
                            label: 'Energy Usage',
                            data: values,
                            borderColor: colorFaded,
                            backgroundColor: 'transparent',
                            fill: false,
                            borderWidth: 0.8,
                            pointRadius: 0,
                            pointHoverRadius: 0,
                            tension: 0.15,
                            order: 3,
                        },
                        {
                            label: 'Rolling Mean',
                            data: rollingMeans,
                            borderColor: '#F59E0B',
                            backgroundColor: 'transparent',
                            fill: false,
                            borderWidth: 2,
                            borderDash: [8, 3],
                            pointRadius: 0,
                            pointHoverRadius: 0,
                            tension: 0.4,
                            order: 2,
                        },
                        {
                            label: 'Anomaly',
                            data: anomalyValues,
                            borderColor: 'transparent',
                            backgroundColor: '#EF4444',
                            pointRadius: 6,
                            pointHoverRadius: 9,
                            pointBorderColor: '#FF8080',
                            pointBorderWidth: 2,
                            showLine: false,
                            order: 1,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { duration: 200 },
                    interaction: { mode: 'nearest', axis: 'x', intersect: true },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            filter: item => item.datasetIndex === 2,
                            backgroundColor: '#160306',
                            titleColor: '#E8DCD4',
                            bodyColor: '#B5A99F',
                            borderColor: '#551F22',
                            borderWidth: 1,
                            padding: { top: 10, bottom: 12, left: 14, right: 14 },
                            titleFont: { family: 'DM Sans', size: 11, weight: '600' },
                            bodyFont: { family: 'DM Sans', size: 11 },
                            bodySpacing: 4,
                            callbacks: tooltipCallbacks,
                        },
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: '#6B5C54', maxTicksLimit: 12,
                                maxRotation: 0, autoSkip: true,
                                font: { family: 'DM Sans', size: 10 },
                            },
                            grid: { display: false },
                            border: { color: 'rgba(89,70,59,0.25)' },
                        },
                        y: {
                            ticks: {
                                color: '#6B5C54', maxTicksLimit: 6,
                                font: { family: 'DM Sans', size: 10 },
                                padding: 8,
                            },
                            grid: { color: 'rgba(89,70,59,0.07)' },
                            border: { color: 'rgba(89,70,59,0.25)', dash: [3, 3] },
                        },
                    },
                },
            })
        } else {
            const c = chartInstance.current
            c.data.labels = labels
            c.data.datasets[0].data = values
            c.data.datasets[0].borderColor = colorFaded
            c.data.datasets[1].data = rollingMeans
            c.data.datasets[2].data = anomalyValues
            c.options.plugins.tooltip.callbacks = tooltipCallbacks
            c.update('none')
        }
    }, [slicedData, streamName])

    useEffect(() => { updateChart() }, [updateChart])

    useEffect(() => {
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy()
                chartInstance.current = null
            }
        }
    }, [])

    return (
        <div className="card mb-4" style={{ padding: '24px' }}>
            <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px', flexWrap: 'wrap', gap: '12px',
            }}>
                <h5 style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 600, margin: 0, textTransform: 'capitalize',
                }}>
                    {streamName} — Time Series
                </h5>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                        <span style={{
                            display: 'inline-block', width: '22px', height: '2px',
                            backgroundColor: (STREAM_COLORS[streamName] || '#888') + '45',
                        }} />
                        Energy Usage
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                        <span style={{
                            display: 'inline-block', width: '22px', height: '0px',
                            borderTop: '1.5px dashed #F59E0B',
                        }} />
                        Rolling Mean
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.78rem', color: 'var(--color-muted)' }}>
                        <span style={{
                            display: 'inline-block', width: '10px', height: '10px',
                            borderRadius: '50%', backgroundColor: '#EF4444',
                            border: '1.5px solid #FF8080',
                        }} />
                        Anomaly
                    </span>
                </div>
            </div>
            <div className="chart-fadein" style={{ height: '360px', position: 'relative' }}>
                <canvas ref={chartRef} />
            </div>
        </div>
    )
}

export default EnergyChart