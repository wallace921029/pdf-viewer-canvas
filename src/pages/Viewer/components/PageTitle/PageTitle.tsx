import styles from "./styles/page-title.module.scss";

function PageTitle() {
  return (
    <div className={styles.pageTitle}>
      <span>
        系统综合实验：心血管与呼吸系统如何协同响应不同生理刺激与药物调节
      </span>
      <span>作者: 冯少桐 | 生理科学实验 7 班 1 组</span>
      <span>日期: 2023-10-01</span>
      <span>得分: 92.5</span>
      <span>等级: 优秀</span>
    </div>
  );
}

export default PageTitle;
