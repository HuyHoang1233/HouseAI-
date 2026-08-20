'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const navbarRef = useRef<HTMLElement>(null);
  const contactFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (navbarRef.current) {
        navbarRef.current.classList.toggle('scrolled', window.scrollY > 50);
      }
    };
    window.addEventListener('scroll', handleScroll);
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { 
        if (e.isIntersecting) { 
          e.target.classList.add('active'); 
        } 
      });
    }, { threshold: 0.15 });
    
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    const statsObs = new IntersectionObserver((entries) => {
      entries.forEach(e => { 
        if (e.isIntersecting) { 
          animateCounters(); 
          statsObs.disconnect(); 
        } 
      });
    }, { threshold: 0.5 });
    
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
      statsObs.observe(heroStats);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      statsObs.disconnect();
    };
  }, []);

  const animateCounters = () => {
    document.querySelectorAll('.stat h3').forEach(el => {
      const text = el.textContent || '';
      const num = parseInt(text.replace(/[^0-9]/g, ''));
      const suffix = text.replace(/[0-9,]/g, '');
      let current = 0;
      const step = Math.ceil(num / 60);
      const timer = setInterval(() => {
        current += step;
        if (current >= num) { 
          current = num; 
          clearInterval(timer); 
        }
        el.textContent = current.toLocaleString() + suffix;
      }, 30);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (!contactFormRef.current) return;
    const btn = contactFormRef.current.querySelector('.btn-submit') as HTMLButtonElement;
    if (!btn) return;

    // Get form data
    const nameInput = contactFormRef.current.querySelector('#name') as HTMLInputElement;
    const phoneInput = contactFormRef.current.querySelector('#phone') as HTMLInputElement;
    const emailInput = contactFormRef.current.querySelector('#email') as HTMLInputElement;
    const serviceInput = contactFormRef.current.querySelector('#service') as HTMLSelectElement;
    const messageInput = contactFormRef.current.querySelector('#message') as HTMLTextAreaElement;

    const payload = {
      customerName: nameInput?.value || '',
      phone: phoneInput?.value || '',
      email: emailInput?.value || '',
      service: serviceInput?.value || '',
      message: messageInput?.value || '',
    };

    // Loading state
    btn.disabled = true;
    btn.textContent = '⏳ Đang gửi...';
    btn.style.background = 'linear-gradient(135deg, #95a5a6, #bdc3c7)';

    try {
      const token = authService.getToken();
      const res = await fetch('http://localhost:8080/api/quotes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Gửi yêu cầu thất bại');
      }

      // Success
      btn.textContent = '✅ Đã gửi thành công!';
      btn.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
      setTimeout(() => {
        btn.textContent = 'Gửi Yêu Cầu Báo Giá';
        btn.style.background = '';
        btn.disabled = false;
        contactFormRef.current?.reset();
      }, 3000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra';
      btn.textContent = '❌ ' + errorMessage;
      btn.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
      setTimeout(() => {
        btn.textContent = 'Gửi Yêu Cầu Báo Giá';
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar" id="navbar" ref={navbarRef}>
        <div className="logo">
          Sơn Nano
        </div>
        <ul className="nav-links">
          <li><a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}>Trang chủ</a></li>
          <li><a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>Dịch vụ</a></li>
          <li><a href="#portfolio" onClick={(e) => { e.preventDefault(); scrollToSection('portfolio'); }}>Dự án</a></li>
          <li><a href="#why-us" onClick={(e) => { e.preventDefault(); scrollToSection('why-us'); }}>Về chúng tôi</a></li>
          <li><a href="#process" onClick={(e) => { e.preventDefault(); scrollToSection('process'); }}>Quy trình</a></li>
          <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Liên hệ</a></li>
        </ul>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '15px', fontWeight: '600', color: '#E8702A' }}>
                Chào, {user?.fullName || user?.username}
              </span>
              <button 
                onClick={() => { authService.logout(); window.location.reload(); }} 
                style={{ fontSize: '13px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <a href="/login" style={{ fontSize: '15px', fontWeight: '500', color: '#555', textDecoration: 'none' }}>Đăng nhập</a>
          )}
          <button className="nav-cta" onClick={() => scrollToSection('contact')}>Báo Giá Miễn Phí</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" id="hero">
        <div className="hero-content">
          <div className="hero-badge"><span className="dot"></span> #1 Dịch Vụ Sơn Nhà Tại Việt Nam</div>
          <h1>Biến Ngôi Nhà Bạn Thành <span>Tác Phẩm Nghệ Thuật</span></h1>
          <p>Với hơn 15 năm kinh nghiệm, đội ngũ thợ sơn chuyên nghiệp của chúng tôi mang đến cho ngôi nhà bạn diện mạo hoàn toàn mới.</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => scrollToSection('contact')}>Đặt Lịch Ngay</button>
            <button className="btn-outline" onClick={() => scrollToSection('portfolio')}>Xem Dự Án</button>
          </div>
          <div className="hero-stats">
            <div className="stat"><h3>15+</h3><p>Năm kinh nghiệm</p></div>
            <div className="stat"><h3>2,500+</h3><p>Dự án hoàn thành</p></div>
            <div className="stat"><h3>99%</h3><p>Khách hàng hài lòng</p></div>
          </div>
        </div>
        <div className="hero-image">
          <img src="/images/hero-painting.png" alt="Dịch vụ sơn nhà chuyên nghiệp" />
        </div>
      </section>

      {/* SERVICES */}
      <section id="services">
        <div className="section-header reveal">
          <span className="section-tag">Dịch Vụ</span>
          <h2>Giải Pháp Sơn Nhà <span>Toàn Diện</span></h2>
          <p>Chúng tôi cung cấp đầy đủ các dịch vụ sơn nhà từ tư vấn, thi công đến bảo hành dài hạn.</p>
        </div>
        <div className="services-grid">
          <div className="service-card reveal">
            <div className="service-icon">🏠</div>
            <h3>Sơn Nội Thất</h3>
            <p>Sơn tường, trần nhà với các loại sơn cao cấp. Cam kết bề mặt mịn màng, màu sắc bền đẹp theo thời gian.</p>
          </div>
          <div className="service-card reveal">
            <div className="service-icon">🏗️</div>
            <h3>Sơn Ngoại Thất</h3>
            <p>Sơn mặt tiền, tường ngoài chống thấm, chống nắng. Bảo vệ ngôi nhà trước thời tiết khắc nghiệt.</p>
          </div>
          <div className="service-card reveal">
            <div className="service-icon">🎨</div>
            <h3>Tư Vấn Màu Sắc</h3>
            <p>Đội ngũ thiết kế tư vấn phối màu phù hợp phong cách, không gian sống và sở thích của bạn.</p>
          </div>
          <div className="service-card reveal">
            <div className="service-icon">🔧</div>
            <h3>Xử Lý Bề Mặt</h3>
            <p>Trám vết nứt, xử lý ẩm mốc, bong tróc trước khi sơn. Đảm bảo bề mặt hoàn hảo nhất.</p>
          </div>
          <div className="service-card reveal">
            <div className="service-icon">🏢</div>
            <h3>Sơn Công Trình</h3>
            <p>Thi công sơn cho văn phòng, nhà hàng, khách sạn và các công trình thương mại lớn nhỏ.</p>
          </div>
          <div className="service-card reveal">
            <div className="service-icon">✨</div>
            <h3>Sơn Trang Trí</h3>
            <p>Sơn hiệu ứng đặc biệt: sơn giả đá, sơn hoa văn, sơn metallic tạo điểm nhấn độc đáo.</p>
          </div>
        </div>
      </section>

      {/* PORTFOLIO */}
      <section id="portfolio" style={{ background: '#F8F9FA' }}>
        <div className="section-header reveal">
          <span className="section-tag">Dự Án</span>
          <h2>Công Trình <span>Tiêu Biểu</span></h2>
          <p>Những dự án chúng tôi tự hào đã hoàn thành với chất lượng vượt trội.</p>
        </div>
        <div className="portfolio-grid">
          <div className="portfolio-item reveal">
            <img src="/images/hero-painting.png" alt="Sơn phòng khách" />
            <div className="portfolio-overlay">
              <h4>Biệt Thự Phú Mỹ Hưng</h4>
              <p>Sơn nội thất toàn bộ • 2024</p>
            </div>
          </div>
          <div className="portfolio-item reveal">
            <img src="/images/exterior-painting.png" alt="Sơn ngoại thất" />
            <div className="portfolio-overlay">
              <h4>Nhà Phố Quận 7</h4>
              <p>Sơn ngoại thất • 2024</p>
            </div>
          </div>
          <div className="portfolio-item reveal">
            <img src="/images/interior-bedroom.png" alt="Sơn phòng ngủ" />
            <div className="portfolio-overlay">
              <h4>Căn Hộ Vinhomes</h4>
              <p>Sơn phòng ngủ • 2024</p>
            </div>
          </div>
          <div className="portfolio-item reveal">
            <img src="/images/before-after.png" alt="Trước và sau" />
            <div className="portfolio-overlay">
              <h4>Cải Tạo Nhà Cũ</h4>
              <p>Sơn lại toàn bộ • 2023</p>
            </div>
          </div>
          <div className="portfolio-item reveal">
            <img src="/images/color-consultation.png" alt="Tư vấn màu sơn" />
            <div className="portfolio-overlay">
              <h4>Tư Vấn & Phối Màu</h4>
              <p>Dịch vụ tư vấn • 2024</p>
            </div>
          </div>
          <div className="portfolio-item reveal">
            <img src="/images/team-painters.png" alt="Đội ngũ thi công" />
            <div className="portfolio-overlay">
              <h4>Đội Ngũ Chuyên Nghiệp</h4>
              <p>50+ thợ sơn lành nghề</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section id="why-us">
        <div className="why-us reveal">
          <div className="why-us-image">
            <img src="/images/team-painters.png" alt="Đội ngũ Sơn Nano" />
          </div>
          <div className="why-us-content">
            <span className="section-tag">Tại Sao Chọn Chúng Tôi</span>
            <h2>Uy Tín Tạo Nên <span>Thương Hiệu</span></h2>
            <p>Sơn Nano cam kết mang đến dịch vụ sơn nhà chất lượng cao nhất với giá cả hợp lý.</p>
            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon">🛡️</div>
                <div><h4>Bảo Hành 5 Năm</h4><p>Cam kết bảo hành lên đến 5 năm cho mọi công trình thi công.</p></div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">💰</div>
                <div><h4>Giá Cả Minh Bạch</h4><p>Báo giá chi tiết, không phát sinh chi phí. Thanh toán linh hoạt theo giai đoạn.</p></div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">⏰</div>
                <div><h4>Đúng Tiến Độ</h4><p>Cam kết hoàn thành đúng tiến độ đã cam kết, không gây phiền hà cho gia chủ.</p></div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🎯</div>
                <div><h4>Sơn Chính Hãng</h4><p>Sử dụng 100% sơn chính hãng từ Dulux, Jotun, Nippon với đầy đủ chứng nhận.</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" style={{ background: '#F8F9FA' }}>
        <div className="section-header reveal">
          <span className="section-tag">Quy Trình</span>
          <h2>4 Bước Để Có <span>Ngôi Nhà Mới</span></h2>
          <p>Quy trình làm việc chuyên nghiệp, minh bạch từ A đến Z.</p>
        </div>
        <div className="process-steps">
          <div className="process-step reveal">
            <div className="step-number">1</div>
            <h3>Khảo Sát & Tư Vấn</h3>
            <p>Đội ngũ đến tận nơi khảo sát, đo đạc và tư vấn phương án sơn phù hợp nhất.</p>
          </div>
          <div className="process-step reveal">
            <div className="step-number">2</div>
            <h3>Báo Giá Chi Tiết</h3>
            <p>Gửi báo giá minh bạch, chi tiết từng hạng mục. Không phát sinh thêm chi phí.</p>
          </div>
          <div className="process-step reveal">
            <div className="step-number">3</div>
            <h3>Thi Công Chuyên Nghiệp</h3>
            <p>Đội thợ lành nghề thi công đúng kỹ thuật, sạch sẽ và đảm bảo tiến độ.</p>
          </div>
          <div className="process-step reveal">
            <div className="step-number">4</div>
            <h3>Nghiệm Thu & Bảo Hành</h3>
            <p>Nghiệm thu cùng gia chủ, bàn giao sạch sẽ và cấp giấy bảo hành 5 năm.</p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials">
        <div className="section-header reveal">
          <span className="section-tag">Đánh Giá</span>
          <h2>Khách Hàng <span>Nói Gì</span></h2>
          <p>Hàng ngàn khách hàng đã tin tưởng sử dụng dịch vụ của Sơn Nano.</p>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card reveal">
            <div className="stars">★★★★★</div>
            <blockquote>"Rất hài lòng với dịch vụ của Sơn Nano. Thợ sơn tay nghề cao, làm việc rất cẩn thận và sạch sẽ. Nhà mình giờ đẹp như mới!"</blockquote>
            <div className="testimonial-author">
              <div className="author-avatar">TH</div>
              <div className="author-info"><h5>Trần Hương</h5><p>Quận 2, TP.HCM</p></div>
            </div>
          </div>
          <div className="testimonial-card reveal">
            <div className="stars">★★★★★</div>
            <blockquote>"Giá cả hợp lý, thi công nhanh chóng và đúng hẹn. Đặc biệt là dịch vụ tư vấn màu sắc rất chuyên nghiệp, giúp mình chọn được màu ưng ý."</blockquote>
            <div className="testimonial-author">
              <div className="author-avatar">NM</div>
              <div className="author-info"><h5>Nguyễn Minh</h5><p>Quận 7, TP.HCM</p></div>
            </div>
          </div>
          <div className="testimonial-card reveal">
            <div className="stars">★★★★★</div>
            <blockquote>"Đã sử dụng dịch vụ 3 lần cho các căn nhà khác nhau. Lần nào cũng rất hài lòng. Bảo hành tốt, phản hồi nhanh khi cần hỗ trợ."</blockquote>
            <div className="testimonial-author">
              <div className="author-avatar">LV</div>
              <div className="author-info"><h5>Lê Văn</h5><p>Thủ Đức, TP.HCM</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-section reveal">
        <h2>Sẵn Sàng Làm Mới Ngôi Nhà?</h2>
        <p>Liên hệ ngay để nhận tư vấn miễn phí và báo giá chi tiết trong 24 giờ!</p>
        <button className="btn-white" onClick={() => scrollToSection('contact')}>📞 Liên Hệ Ngay - 0901 234 567</button>
      </div>

      {/* CONTACT */}
      <section id="contact">
        <div className="section-header reveal">
          <span className="section-tag">Liên Hệ</span>
          <h2>Nhận <span>Báo Giá Miễn Phí</span></h2>
          <p>Gửi thông tin để được tư vấn và báo giá nhanh nhất.</p>
        </div>
        <div className="contact-wrapper reveal">
          <div className="contact-info">
            <h3>Thông Tin Liên Hệ</h3>
            <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. Hãy liên hệ qua bất kỳ kênh nào bên dưới.</p>
            <div className="info-item">
              <div className="info-icon">📍</div>
              <div><h4>Địa Chỉ</h4><p>123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh</p></div>
            </div>
            <div className="info-item">
              <div className="info-icon">📞</div>
              <div><h4>Điện Thoại</h4><p>0901 234 567 - 0912 345 678</p></div>
            </div>
            <div className="info-item">
              <div className="info-icon">✉️</div>
              <div><h4>Email</h4><p>info@sonnano.vn</p></div>
            </div>
            <div className="info-item">
              <div className="info-icon">🕐</div>
              <div><h4>Giờ Làm Việc</h4><p>Thứ 2 - Chủ Nhật: 7:00 - 18:00</p></div>
            </div>
          </div>
          <form className="contact-form" id="contactForm" ref={contactFormRef} onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group"><label htmlFor="name">Họ và Tên *</label><input type="text" id="name" placeholder="Nguyễn Văn A" required /></div>
              <div className="form-group"><label htmlFor="phone">Số Điện Thoại *</label><input type="tel" id="phone" placeholder="0901 234 567" required /></div>
            </div>
            <div className="form-group"><label htmlFor="email">Email</label><input type="email" id="email" placeholder="email@example.com" /></div>
            <div className="form-group">
              <label htmlFor="service">Dịch Vụ Quan Tâm</label>
              <select id="service">
                <option value="">-- Chọn dịch vụ --</option>
                <option value="interior">Sơn Nội Thất</option>
                <option value="exterior">Sơn Ngoại Thất</option>
                <option value="consultation">Tư Vấn Màu Sắc</option>
                <option value="repair">Xử Lý Bề Mặt</option>
                <option value="commercial">Sơn Công Trình</option>
                <option value="decorative">Sơn Trang Trí</option>
              </select>
            </div>
            <div className="form-group"><label htmlFor="message">Mô Tả Yêu Cầu</label><textarea id="message" placeholder="Mô tả chi tiết nhu cầu sơn nhà của bạn..."></textarea></div>
            <button type="submit" className="btn-submit">Gửi Yêu Cầu Báo Giá</button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo">
              Sơn Nano
            </div>
            <p>Dịch vụ sơn nhà chuyên nghiệp hàng đầu Việt Nam. Uy tín - Chất lượng - Giá tốt. Bảo hành lên đến 5 năm.</p>
          </div>
          <div className="footer-col">
            <h4>Dịch Vụ</h4>
            <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>Sơn Nội Thất</a>
            <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>Sơn Ngoại Thất</a>
            <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>Tư Vấn Màu Sắc</a>
            <a href="#services" onClick={(e) => { e.preventDefault(); scrollToSection('services'); }}>Sơn Trang Trí</a>
          </div>
          <div className="footer-col">
            <h4>Công Ty</h4>
            <a href="#why-us" onClick={(e) => { e.preventDefault(); scrollToSection('why-us'); }}>Về Chúng Tôi</a>
            <a href="#portfolio" onClick={(e) => { e.preventDefault(); scrollToSection('portfolio'); }}>Dự Án</a>
            <a href="#testimonials" onClick={(e) => { e.preventDefault(); scrollToSection('testimonials'); }}>Đánh Giá</a>
            <a href="#process" onClick={(e) => { e.preventDefault(); scrollToSection('process'); }}>Quy Trình</a>
          </div>
          <div className="footer-col">
            <h4>Hỗ Trợ</h4>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Liên Hệ</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Báo Giá</a>
            <a href="#">Chính Sách Bảo Hành</a>
            <a href="#">Câu Hỏi Thường Gặp</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 Sơn Nano. Tất cả quyền được bảo lưu.</p>
          <div className="social-links">
            <a href="#" title="Facebook">f</a>
            <a href="#" title="Zalo">Z</a>
            <a href="#" title="YouTube">▶</a>
            <a href="#" title="TikTok">♪</a>
          </div>
        </div>
      </footer>
    </>
  );
}
