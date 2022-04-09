/* Styles */
import './fill-available.scss'

const FillAvailable = function (props) {
  const { children } = props

  return (
    <span className="app-fill-available-outer">
      <span className="app-fill-available-inner">{children}</span>
    </span>
  )
}

export { FillAvailable }
