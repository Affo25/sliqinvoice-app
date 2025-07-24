export default function Footer() {
  return (
    <div className="nk-footer">
      <div className="container-fluid">
        <div className="nk-footer-wrap">
          <div className="nk-footer-copyright">
            &copy; {new Date().getFullYear()} SliqInvoice. Dashboard by <a href="#">Your Company</a>
          </div>
          <div className="nk-footer-links">
            <ul className="nav nav-sm">
              <li className="nav-item">
                <a className="nav-link" href="#">Terms</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Privacy</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Help</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 