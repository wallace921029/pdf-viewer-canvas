import styles from "./styles/page-title.module.scss";

function PageTitle() {
  return (
    <div className={styles.pageTitle}>
      <span>双缝干涉实验报告</span>
      <span>作者: 张三</span>
      <span>日期: 2023-10-01</span>
      <span>得分: 92.5</span>
      <span>等级: 优秀</span>
    </div>
  );
}

export default PageTitle;
