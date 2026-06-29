export interface PatchNote {
  version: string
  date: string
  summary: string
  summaryEn: string
  changes: Array<{
    category: 'agent' | 'weapon' | 'map' | 'system'
    categoryLabel: string
    categoryLabelEn: string
    type: 'buff' | 'nerf' | 'adjust'
    title: string
    titleEn: string
    details: string[]
    detailsEn: string[]
  }>
}

export const patchData: PatchNote[] = [
  {
    version: 'PATCH 9.02',
    date: '25/06/2026',
    summary: 'Bản cập nhật cân bằng hiệu năng vũ khí và điều chỉnh hoạt ảnh của một số Đặc vụ.',
    summaryEn: 'Performance weapon balance update and animation tweaks for several Agents.',
    changes: [
      {
        category: 'weapon',
        categoryLabel: 'Vũ khí',
        categoryLabelEn: 'Weapons',
        type: 'adjust',
        title: 'Điều chỉnh độ giật của súng Vandal',
        titleEn: 'Vandal Recoil Recovery Adjustments',
        details: [
          'Tốc độ phục hồi tâm bắn sau khi ngắt giật tăng nhẹ từ 0.35s lên 0.38s.',
          'Độ sai lệch đạn đầu tiên khi ngắm ADS giảm từ 0.15 xuống 0.12.',
        ],
        detailsEn: [
          'Recoil recovery rate slightly increased from 0.35s to 0.38s.',
          'First bullet spread when aiming down sight (ADS) decreased from 0.15 to 0.12.',
        ],
      },
      {
        category: 'agent',
        categoryLabel: 'Đặc vụ',
        categoryLabelEn: 'Agents',
        type: 'nerf',
        title: 'Nerf Đặc vụ Neon',
        titleEn: 'Neon Ability Balancing (Nerf)',
        details: [
          'Kỹ năng Lướt (High Gear): Nhiên liệu tiêu hao khi trượt tăng thêm 15%.',
          'Thời gian rút súng sau khi trượt tăng từ 0.2s lên 0.3s.',
        ],
        detailsEn: [
          'High Gear (Slide): Slide fuel drain increased by 15%.',
          'Equip time transition after sliding increased from 0.2s to 0.3s.',
        ],
      },
    ],
  },
  {
    version: 'PATCH 9.0',
    date: '02/06/2026',
    summary: 'Mùa giải mới Episode 9: Khởi tranh giải đấu quốc tế và ra mắt bản đồ chiến thuật mới Abyss.',
    summaryEn: 'Episode 9 Launch: International tournament kickoff and debut of the new vertical map Abyss.',
    changes: [
      {
        category: 'map',
        categoryLabel: 'Bản đồ',
        categoryLabelEn: 'Maps',
        type: 'adjust',
        title: 'Ra mắt Bản đồ mới: Abyss',
        titleEn: 'New Map Released: Abyss',
        details: [
          'Abyss là bản đồ đầu tiên trong game không có ranh giới chết (người chơi có thể bị ngã xuống vực thẳm và chết rơi tự do).',
          'Bố cục bản đồ 3 đường truyền thống với nhiều điểm phục kích thẳng đứng.',
        ],
        detailsEn: [
          'Abyss is the first map in the game with no boundaries (players can fall off the cliff and die from fall).',
          'Traditional 3-lane layout with multiple vertical drop vantage points.',
        ],
      },
      {
        category: 'agent',
        categoryLabel: 'Đặc vụ',
        categoryLabelEn: 'Agents',
        type: 'buff',
        title: 'Buff Đặc vụ Iso',
        titleEn: 'Iso Combat Shield Buffs',
        details: [
          'Kỹ năng Tự Vệ (Double Tap): Thời gian duy trì khiên tăng từ 15s lên 20s.',
          'Không còn yêu cầu phải bắn hạ quả cầu năng lượng để kích hoạt khiên lần đầu, khiên tự động kích hoạt ngay sau khi bấm kỹ năng.',
        ],
        detailsEn: [
          'Double Tap: Shield duration increased from 15s to 20s.',
          'No longer requires shooting an energy orb to activate the first shield. Shield automatically activates immediately upon casting.',
        ],
      },
      {
        category: 'agent',
        categoryLabel: 'Đặc vụ',
        categoryLabelEn: 'Agents',
        type: 'nerf',
        title: 'Nerf Đặc vụ Jett',
        titleEn: 'Jett Dash Windup Balances (Nerf)',
        details: [
          'Thời gian chuẩn bị kích hoạt Thuận Phong (Dash) tăng từ 0.75s lên 1.0s.',
          'Độ dài khói phóng của kỹ năng Đột Kích giảm đi 0.5s.',
        ],
        detailsEn: [
          'Windup activation window for Tailwind (Dash) increased from 0.75s to 1.0s.',
          'Cloudburst smoke duration reduced by 0.5s.',
        ],
      },
    ],
  },
  {
    version: 'PATCH 8.11',
    date: '15/05/2026',
    summary: 'Cập nhật lại vòng xoay bản đồ đấu giải và tinh chỉnh sức mạnh nhóm Đặc vụ Hộ Vệ.',
    summaryEn: 'Competitve Map Pool rotation changes and Sentinel agent balance updates.',
    changes: [
      {
        category: 'map',
        categoryLabel: 'Bản đồ',
        categoryLabelEn: 'Maps',
        type: 'adjust',
        title: 'Cập nhật bản đồ Haven quay lại đấu giải',
        titleEn: 'Haven Map Returns to competitive pool',
        details: [
          'Haven quay trở lại danh sách thi đấu xếp hạng chính thức.',
          'Bản đồ Split tạm thời rời vòng xoay đấu giải.',
        ],
        detailsEn: [
          'Haven returns to the official competitive matchmaking map list.',
          'Split is temporarily rotated out of the pool.',
        ],
      },
      {
        category: 'agent',
        categoryLabel: 'Đặc vụ',
        categoryLabelEn: 'Agents',
        type: 'buff',
        title: 'Buff Đặc vụ Cypher',
        titleEn: 'Cypher Trapwire Tweaks',
        details: [
          'Bẫy dây công nghệ (Trapwire) tái kích hoạt nhanh hơn 0.5s sau khi bắt được kẻ địch.',
          'Thời gian hiển thị bóng kẻ địch khi dính bẫy tăng nhẹ.',
        ],
        detailsEn: [
          'Trapwire re-arms 0.5s faster after catching an enemy.',
          'Visual wall-hack outline duration on caught targets increased slightly.',
        ],
      },
    ],
  },
]
