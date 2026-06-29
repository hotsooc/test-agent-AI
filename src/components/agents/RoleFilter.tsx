import { useGame } from '../../context/GameContext'

interface RoleOption {
  uuid: string
  displayName: string
}

interface RoleFilterProps {
  roles: RoleOption[]
  selectedUuid: string
  onSelect: (uuid: string) => void
}

export default function RoleFilter({ roles, selectedUuid, onSelect }: RoleFilterProps) {
  const { colorPrimary } = useGame()

  return (
    <div className="flex justify-center flex-wrap gap-2 mb-10">
      <button
        onClick={() => onSelect('ALL')}
        className={`px-5 py-2.5 text-xs font-bold tracking-[1px] uppercase rounded border-none cursor-pointer transition-all duration-300 ${
          selectedUuid === 'ALL'
            ? 'text-white'
            : 'bg-[rgba(15,25,35,0.65)] text-white/70 hover:text-white hover:bg-[rgba(15,25,35,0.9)] border border-white/5'
        }`}
        style={{
          backgroundColor: selectedUuid === 'ALL' ? colorPrimary : undefined,
          boxShadow: selectedUuid === 'ALL' ? `0 0 10px ${colorPrimary}66` : undefined,
        }}
      >
        ALL
      </button>
      {roles.map((role) => (
        <button
          key={role.uuid}
          onClick={() => onSelect(role.uuid)}
          className={`px-5 py-2.5 text-xs font-bold tracking-[1px] uppercase rounded border-none cursor-pointer transition-all duration-300 ${
            selectedUuid === role.uuid
              ? 'text-white'
              : 'bg-[rgba(15,25,35,0.65)] text-white/70 hover:text-white hover:bg-[rgba(15,25,35,0.9)] border border-white/5'
          }`}
          style={{
            backgroundColor: selectedUuid === role.uuid ? colorPrimary : undefined,
            boxShadow: selectedUuid === role.uuid ? `0 0 10px ${colorPrimary}66` : undefined,
          }}
        >
          {role.displayName}
        </button>
      ))}
    </div>
  )
}
