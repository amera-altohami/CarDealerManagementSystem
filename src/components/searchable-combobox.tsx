import { CheckIcon, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export type SearchableOption = {
  label: string
  value: string
  description?: string
}

type SearchableComboboxProps = {
  value?: string
  onValueChange: (value: string) => void
  options: SearchableOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  allowCreate?: boolean
  onCreate?: (searchValue: string) => void
  createLabel?: string
}

export function SearchableCombobox({
  value,
  onValueChange,
  options,
  placeholder = 'Select option',
  searchPlaceholder = 'Search...',
  emptyText = 'No results found.',
  className,
  allowCreate = false,
  onCreate,
  createLabel = 'Add new item',
}: SearchableComboboxProps) {
  const selected = options.find((option) => option.value === value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          className={cn('w-full justify-between', className)}
        >
          <span className='truncate'>
            {selected?.label ?? placeholder}
          </span>
          <ChevronsUpDown className='ms-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[--radix-popover-trigger-width] p-0' align='start'>
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => onValueChange(option.value)}
                >
                  <CheckIcon
                    className={cn(
                      'me-2 h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className='flex flex-col'>
                    <span>{option.label}</span>
                    {option.description ? (
                      <span className='text-xs text-muted-foreground'>
                        {option.description}
                      </span>
                    ) : null}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {allowCreate && onCreate ? (
              <CommandGroup heading='Create'>
                <CommandItem
                  onSelect={(searchValue) => onCreate(searchValue)}
                >
                  {createLabel}
                </CommandItem>
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

