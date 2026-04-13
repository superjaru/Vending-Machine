export interface CreateLocationDto {
  name:     string
  address?: string
  city?:    string
}

export interface UpdateLocationDto {
  name?:      string
  address?:   string
  city?:      string
  is_active?: boolean
}
