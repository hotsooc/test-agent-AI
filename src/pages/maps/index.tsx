import { useState, useEffect } from 'react'
import { Row, Col } from 'antd'
import { useLanguage } from '../../context/LanguageContext'
import { useGame } from '../../context/GameContext'
import { getMaps } from '../../api/valorant'
import { getCsgoMaps } from '../../api/csgo'
import { MapData } from '../../types/valorant'
import Loader from '../../components/Loader'
import PageContainer from '../../components/PageContainer'
import MapCard from '../../components/maps/MapCard'
import MapDetailModal from '../../components/maps/MapDetailModal'

export default function Maps() {
  const { language, isVi } = useLanguage()
  const { isValorant, colorPrimary } = useGame()
  const [maps, setMaps] = useState<MapData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMap, setSelectedMap] = useState<MapData | null>(null)

  useEffect(() => {
    setLoading(true)
    const fetchMaps = isValorant ? getMaps(language) : getCsgoMaps(language)

    fetchMaps
      .then((data) => {
        const filtered = data.filter((map) => map.displayName && map.listViewIcon)
        setMaps(filtered)
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [language, isValorant])

  if (loading) return <Loader tip={isVi ? (isValorant ? 'Đang tải dữ liệu Bản đồ...' : 'Đang tải bản đồ CS:GO 2...') : 'Loading Maps data...'} />
  if (!maps.length) return <PageContainer><div className="text-center text-[#8f9499] py-20">{isVi ? 'Không có dữ liệu bản đồ.' : 'No map data available.'}</div></PageContainer>

  return (
    <PageContainer>
      <div className="text-left mb-8">
        <h2 className="tracking-[2px] text-sm font-bold m-0 mb-1" style={{ color: colorPrimary }}>
          {isVi 
            ? (isValorant ? 'VALORANT BẢN ĐỒ' : 'CS:GO 2 BẢN ĐỒ') 
            : (isValorant ? 'VALORANT MAPS' : 'CS:GO 2 MAPS')}
        </h2>
        <h1 className="text-white m-0 text-[36px] font-bold">
          {isVi ? 'DANH SÁCH BẢN ĐỒ CHIẾN THUẬT' : 'TACTICAL MAP LIST'}
        </h1>
      </div>

      <Row gutter={[24, 24]}>
        {maps.map((map) => (
          <Col xs={24} sm={12} md={8} key={map.uuid}>
            <MapCard map={map} onClick={() => setSelectedMap(map)} />
          </Col>
        ))}
      </Row>

      <MapDetailModal map={selectedMap} open={selectedMap !== null} onClose={() => setSelectedMap(null)} />
    </PageContainer>
  )
}
